// src/services/DatabaseControl.js
// -----------------------------------------------------------------------------
// Centralized backend control for authentication + database interactions.
// All Supabase-related logic is stored here to keep components clean.
// -----------------------------------------------------------------------------

import supabase from "./supabase-client";

// -----------------------------------------------------------------------------
// GET CURRENT USER ID
// Always fetches from Supabase session - no global variable needed
// -----------------------------------------------------------------------------
export async function getCurrentUserId() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
        console.error("Error getting current user:", error);
        return null;
    }
    
    return user.id;
}

// -----------------------------
// CHECK USERNAME AVAILABILITY
// -----------------------------
export async function checkUsernameExists(username) {
    return await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .maybeSingle();
}

// -----------------------------
// REGISTER USER (AUTH + PROFILE)
// -----------------------------
export async function registerUser(email, password, username) {
    // 1. CREATE ACCOUNT
    const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (signUpError) {
        return { error: signUpError };
    }

    const user = data.user;
    if (!user) {
        return { error: { message: "Signup failed. Try again." } };
    }

    console.log("User registered with ID:", user.id);

    // 2. INSERT PROFILE ROW
    const { error: profileError } = await supabase
        .from("profiles")
        .insert({
            id: user.id,
            username: username,
        });

    return {
        user,
        profileError: profileError ?? null,
        error: null,
    };
}

// -----------------------------
// LOGIN USER (AUTHENTICATION)
// -----------------------------
export async function loginUser(email, password) {
    const result = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (result.data?.user) {
        console.log("User logged in with ID:", result.data.user.id);
    }

    return result;
}

// -----------------------------
// LOG OUT USER (AUTHENTICATION)
// -----------------------------
export async function logoutUser() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Logout error:", error);
        throw error;
    }

    console.log("User logged out successfully");
}

// -----------------------------------------------------------------------------
// INITIALIZE USER SESSION
// Call this when app starts to restore user session
// -----------------------------------------------------------------------------
export async function initializeUserSession() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
        console.error("Error fetching user session:", error);
        return { error };
    }
    
    if (user) {
        console.log("User session restored for ID:", user.id);
        return { user };
    }
    
    return { user: null };
}

// -----------------------------------------------------------------------------
// LISTEN TO AUTH STATE CHANGES
// Set up listener for auth changes (login/logout/session refresh)
// -----------------------------------------------------------------------------
export function setupAuthListener(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
            console.log("Auth state changed - User ID:", session.user.id);
        } else {
            console.log("Auth state changed - User logged out");
        }
        
        // Call the callback with event and session
        if (callback) {
            callback(event, session);
        }
    });

    return subscription;
}

// -----------------------------------------------------------------------------
// GET CURRENT AUTH USER
// -----------------------------------------------------------------------------
export async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return { error };
    return { user };
}

// -----------------------------------------------------------------------------
// FETCH PROFILE FOR LOGGED-IN USER
// -----------------------------------------------------------------------------
export async function getUserProfile(userId = null) {
    let targetUserId = userId;
    
    // If no userId provided, fetch current user's ID
    if (!targetUserId) {
        targetUserId = await getCurrentUserId();
    }
    
    if (!targetUserId) {
        return { error: { message: "No user ID available" } };
    }

    return await supabase
        .from("profiles")
        .select("*")
        .eq("id", targetUserId)
        .single();
}

// -----------------------------------------------------------------------------
// FETCH TRACKERS FOR LOGGED-IN USER (Now includes contributed trackers)
// -----------------------------------------------------------------------------
export async function getUserTrackers(userId = null) {
    let targetUserId = userId;
    
    // If no userId provided, fetch current user's ID
    if (!targetUserId) {
        targetUserId = await getCurrentUserId();
    }
    
    if (!targetUserId) {
        // Return an empty array on error to prevent application crash
        return { data: [], error: { message: "No user ID available" } };
    }

    // 1. Get all tracker_ids the user is associated with from the contributor table
    const { data: contributorData, error: contributorError } = await supabase
        .from("tracker_contributors")
        .select("tracker_id")
        .eq("user_id", targetUserId); // Check if the user is listed in the contributor table

    if (contributorError) {
        console.error("Error fetching contributor trackers:", contributorError);
        return { data: [], error: contributorError };
    }

    const trackerIds = contributorData.map(row => row.tracker_id);

    if (trackerIds.length === 0) {
        return { data: [], error: null }; // No trackers found
    }

    // 2. Fetch the actual tracker data using the list of IDs
    return await supabase
        .from("trackers")
        .select("*")
        .in("id", trackerIds) // Select trackers whose IDs are in the list
        .order("created_at", { ascending: true });
}

// -----------------------------------------------------------------------------
// FETCH STREAK DATA FOR USER
// -----------------------------------------------------------------------------
export async function getUserStreakStats(userId = null) {
    let targetUserId = userId;
    
    // If no userId provided, fetch current user's ID
    if (!targetUserId) {
        targetUserId = await getCurrentUserId();
    }
    
    if (!targetUserId) {
        return { error: { message: "No user ID available" } };
    }

    return await supabase
        .from("streaks")
        .select("*")
        .eq("user_id", targetUserId)
        .single();
}


// -----------------------------------------------------------------------------
// CREATE TRACKER (Main Function)
// -----------------------------------------------------------------------------
export async function createTracker({
    trackerName,
    description,
    bankName,
    interestRate,
    streakEnabled,
    streakMinAmount,
    goalEnabled,
    goalAmount,
    minDailyAmount,
    goalDate,
    contributors
}) {
    try {
        // Get current user ID from Supabase session
        const userId = await getCurrentUserId();
        
        if (!userId) {
            throw new Error("No user is currently logged in. Please log in first.");
        }

        // Fetch owner's profile to get their username
        const { data: ownerProfile, error: ownerProfileError } = await getUserProfile(userId);
        if (ownerProfileError || !ownerProfile || !ownerProfile.username) {
            throw new Error("Could not fetch owner profile or username.");
        }

        console.log("Creating tracker for user ID:", userId);

        // -----------------------------------------
        // INSERT INTO TRACKERS TABLE (No change here)
        // -----------------------------------------
        const { data: trackerData, error: trackerErr } = await supabase
            .from("trackers")
            .insert([
                // ... (existing insert object)
                {
                    owner_id: userId,
                    tracker_name: trackerName,
                    description,
                    bank_name: bankName,
                    interest_rate: interestRate,
                    balance: 0,
                    streak_enabled: streakEnabled,
                    streak_min_amount: streakMinAmount,
                    goal_enabled: goalEnabled,
                    goal_amount: goalAmount,
                    min_daily_amount: minDailyAmount,
                    goal_date: goalDate || null
                }
            ])
            .select()
            .single();

        if (trackerErr) throw trackerErr;

        const trackerId = trackerData.id;
        console.log("Tracker created successfully with ID:", trackerId);

        // -----------------------------------------
        // MANAGE CONTRIBUTORS (New Logic)
        // -----------------------------------------
        await manageTrackerContributors(
            trackerId,
            userId,
            ownerProfile.username,
            contributors
        );
        
        return { success: true, trackerId };

    } catch (err) {
        console.error("Tracker creation error:", err.message);
        return { success: false, error: err.message };
    }
}

// -----------------------------------------------------------------------------
// UPDATE TRACKER (Main Function)
// -----------------------------------------------------------------------------
export async function updateTracker({
    trackerId,
    trackerName,
    description,
    bankName,
    interestRate,
    streakEnabled,
    streakMinAmount,
    goalEnabled,
    goalAmount,
    minDailyAmount,
    goalDate,
    contributors,
    wasStreakEnabled // NEW: Flag to know if streaks were previously enabled
}) {
    try {
        if (!trackerId) {
            throw new Error("Tracker ID is required for update.");
        }

        // Get current user ID
        const currentUserId = await getCurrentUserId();
        if (!currentUserId) {
            throw new Error("User session expired. Please log in again.");
        }
        
        // --- 1. OWNER CHECK --------------------------------
        const { data: trackerDataCheck, error: checkError } = await supabase
            .from("trackers")
            .select("owner_id")
            .eq("id", trackerId)
            .single();

        if (checkError || !trackerDataCheck) {
            throw new Error("Tracker not found or ownership check failed.");
        }
        
        if (trackerDataCheck.owner_id !== currentUserId) {
            throw new Error("Permission Denied: Only the owner can edit this tracker.");
        }

        // --- 2. DELETE STREAK DATA IF DISABLING STREAKS ---
        if (wasStreakEnabled && !streakEnabled) {
            console.log("Streaks disabled - deleting streak data...");
            const deleteResult = await deleteTrackerStreakData(trackerId);
            if (!deleteResult.success) {
                throw new Error("Failed to delete streak data: " + deleteResult.error);
            }
        }

        // Fetch owner's profile to get their username
        const { data: ownerProfile, error: ownerProfileError } = await getUserProfile(currentUserId);
        if (ownerProfileError || !ownerProfile || !ownerProfile.username) {
            throw new Error("Could not fetch owner profile or username.");
        }

        console.log("Updating tracker with ID:", trackerId);

        // --- 3. UPDATE TRACKERS TABLE ---
        const { data: trackerData, error: trackerErr } = await supabase
            .from("trackers")
            .update({
                tracker_name: trackerName,
                description,
                bank_name: bankName,
                interest_rate: interestRate,
                streak_enabled: streakEnabled,
                streak_min_amount: streakEnabled ? streakMinAmount : null,
                goal_enabled: goalEnabled,
                goal_amount: goalAmount,
                min_daily_amount: minDailyAmount,
                goal_date: goalDate || null
            })
            .eq("id", trackerId)
            .select()
            .single();

        if (trackerErr) throw trackerErr;
        
        // --- 4. MANAGE CONTRIBUTORS ---
        await manageTrackerContributors(
            trackerId,
            currentUserId,
            ownerProfile.username,
            contributors
        );

        return { success: true, trackerId: trackerData.id };

    } catch (err) {
        console.error("Tracker update error:", err.message);
        return { success: false, error: err.message };
    }
}


// -----------------------------------------------------------------------------
// DELETE TRACKER (Main Function) <-- NEW FUNCTION
// -----------------------------------------------------------------------------
export async function deleteTracker(trackerId) {
    if (!trackerId) {
        return { success: false, error: "Tracker ID is required for deletion." };
    }

    try {
        // Supabase foreign key constraints should cascade the deletion
        // to related tables (e.g., transactions, contributors).
        const { error } = await supabase
            .from("trackers")
            .delete()
            .eq("id", trackerId);

        if (error) throw error;

        console.log("Tracker deleted successfully with ID:", trackerId);
        return { success: true };
    } catch (err) {
        console.error("Tracker deletion error:", err.message);
        return { success: false, error: err.message };
    }
}


// -----------------------------------------------------------------------------
// FETCH CONTRIBUTORS FOR A TRACKER
// (Helper function needed for pre-filling the Edit form - EXCLUDES OWNER)
// -----------------------------------------------------------------------------
export async function getTrackerContributors(trackerId) {
    if (!trackerId) {
        return { data: [], error: null };
    }
    
    return await supabase
        .from("tracker_contributors")
        .select("username")
        .eq("tracker_id", trackerId)
        .eq("role", "contributor");
}

// -----------------------------------------------------------------------------
// HELPER: MANAGE TRACKER CONTRIBUTORS (Insert/Update Logic)
//   - Ensures the owner is always included.
//   - Finds user_id from username for all contributors.
//   - Performs a complete reset (delete all, insert all) on update.
// -----------------------------------------------------------------------------
async function manageTrackerContributors(trackerId, ownerId, ownerUsername, newContributorsUsernames) {
    // 1. Combine owner and new contributors and deduplicate
    const allUsernames = new Set([ownerUsername]);
    const validContributorsInput = (newContributorsUsernames || [])
        .filter((name) => name.trim() !== "" && name !== ownerUsername); // Filter out empty and owner's own name

    validContributorsInput.forEach(name => allUsernames.add(name));
    const usernamesToLookup = Array.from(allUsernames);

    // 2. Fetch User IDs for all unique usernames
    const { data: profileData, error: lookupError } = await supabase
        .from("profiles")
        .select("id, username")
        .in("username", usernamesToLookup);

    if (lookupError) throw lookupError;
    if (profileData.length < allUsernames.size) {
        // Find missing usernames and warn/throw
        const foundUsernames = new Set(profileData.map(p => p.username));
        const missingUsernames = usernamesToLookup.filter(name => !foundUsernames.has(name));
        console.warn("Skipping unknown contributor usernames:", missingUsernames.join(", "));
    }
    
    // 3. Construct the contributor rows
    const contributorRows = usernamesToLookup
        .map((username) => {
            const profile = profileData.find(p => p.username === username);
            
            if (!profile) return null; // Skip unknown usernames

            const userId = profile.id;
            const isOwner = userId === ownerId;
            
            return {
                tracker_id: trackerId,
                user_id: userId,
                username: username,
                role: isOwner ? 'owner' : 'contributor', // Set the correct role
            };
        })
        .filter(row => row !== null);

    if (contributorRows.length === 0) {
        throw new Error("No valid contributors (including owner) found to insert.");
    }

    // 4. Delete existing contributors (important for update and to ensure no stale data)
    const { error: deleteContribErr } = await supabase
        .from("tracker_contributors")
        .delete()
        .eq("tracker_id", trackerId);

    if (deleteContribErr) throw deleteContribErr;

    // 5. Insert the new/current list of contributors
    const { error: insertContribErr } = await supabase
        .from("tracker_contributors")
        .insert(contributorRows);

    if (insertContribErr) throw insertContribErr;
    console.log("Owner and Contributors added/updated successfully");
}



// -----------------------------------------------------------------------------
// PROCESS A DEPOSIT OR WITHDRAWAL TRANSACTION (Uses Supabase RPC)
// -----------------------------------------------------------------------------
export async function processTrackerTransaction({ trackerId, type, amount, note }) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            throw new Error("User session expired. Please log in again.");
        }

        // We call a PostgreSQL function (RPC) that does all the work:
        // 1. Validates balance (for withdraw)
        // 2. Inserts transaction row
        // 3. Updates the 'trackers' balance
        // 4. Updates the 'tracker_contributors' total_deposited/withdrawn
        
        const { data, error } = await supabase.rpc('process_transaction', {
            p_tracker_id: trackerId,
            p_user_id: userId,
            p_type: type, // 'deposit' or 'withdraw'
            p_amount: amount,
            p_note: note || null
        });

        if (error) {
            // Propagate the specific error message from the DB function
            console.error("RPC Transaction error:", error.message);
            // Check for specific error messages returned by the PL/pgSQL function
            if (error.message.includes("Insufficient funds")) {
                return { success: false, error: "Insufficient funds for this withdrawal." };
            }
            if (error.message.includes("Tracker not found")) {
                return { success: false, error: "Tracker not found." };
            }
            return { success: false, error: error.message };
        }

        console.log(`Transaction successful (Type: ${type}, ID: ${data.id})`);

        let streakResult = null;
        if (type === 'deposit') {
            streakResult = await activateStreak(trackerId, amount);
        }

        return { success: true, transaction: data, streakResult: streakResult};

    } catch (err) {
        console.error("Frontend Transaction processing error:", err.message);
        return { success: false, error: err.message };
    }
}

// -----------------------------------------------------------------------------
// FETCH TRANSACTION HISTORY FOR A TRACKER
// -----------------------------------------------------------------------------
export async function getTrackerTransactions(trackerId, limit = 100) {
    if (!trackerId) return { data: [], error: null };

    // Joins 'transactions' with 'profiles' on user_id to get the 'username'
    return await supabase
        .from("transactions")
        .select(`
            id, 
            type, 
            amount, 
            note, 
            created_at, 
            new_balance,
            profiles (username)
        `)
        .eq("tracker_id", trackerId)
        .order("created_at", { ascending: false }) // Newest transactions first
        .limit(limit);
}

// -----------------------------------------------------------------------------
// FETCH RECENT TRANSACTIONS ACROSS ALL USER'S TRACKERS
// -----------------------------------------------------------------------------
export async function getUserRecentTransactions(userId = null, limit = 10) {
    let targetUserId = userId;
    
    if (!targetUserId) {
        targetUserId = await getCurrentUserId();
    }
    
    if (!targetUserId) {
        return { data: [], error: { message: "No user ID available" } };
    }

    // First, get all tracker IDs the user has access to
    const { data: contributorData, error: contributorError } = await supabase
        .from("tracker_contributors")
        .select("tracker_id")
        .eq("user_id", targetUserId);

    if (contributorError) {
        console.error("Error fetching user trackers:", contributorError);
        return { data: [], error: contributorError };
    }

    const trackerIds = contributorData.map(row => row.tracker_id);

    if (trackerIds.length === 0) {
        return { data: [], error: null };
    }

    // Fetch transactions from all user's trackers with tracker name
    return await supabase
        .from("transactions")
        .select(`
            id, 
            type, 
            amount, 
            note, 
            created_at, 
            new_balance,
            tracker_id,
            trackers (tracker_name),
            profiles (username)
        `)
        .in("tracker_id", trackerIds)
        .order("created_at", { ascending: false })
        .limit(limit);
}



// -----------------------------------------------------------------------------
// STREAK MANAGEMENT FUNCTIONS
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// CHECK AND UPDATE STREAK STATUS
// This should be called when loading a tracker or after a deposit
// -----------------------------------------------------------------------------
export async function checkAndUpdateStreak(trackerId) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return { success: false, error: "No user logged in" };
        }

        // Get tracker details
        const { data: tracker, error: trackerError } = await supabase
            .from("trackers")
            .select("*")
            .eq("id", trackerId)
            .single();

        if (trackerError || !tracker) {
            return { success: false, error: "Tracker not found" };
        }

        // Only proceed if streak is enabled
        if (!tracker.streak_enabled) {
            return { success: true, streakActive: false, streakDays: 0 };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        // Check if streak was already activated today
        const { data: todayLog, error: logError } = await supabase
            .from("streak_logs")
            .select("*")
            .eq("tracker_id", trackerId)
            .eq("user_id", userId)
            .eq("date", todayStr)
            .maybeSingle();

        if (logError && logError.code !== 'PGRST116') { // PGRST116 = no rows
            console.error("Error checking today's streak log:", logError);
        }

        const isTodayActive = todayLog?.is_active || false;

        // Check yesterday's status to determine if streak continues
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const { data: yesterdayLog } = await supabase
            .from("streak_logs")
            .select("is_active")
            .eq("tracker_id", trackerId)
            .eq("user_id", userId)
            .eq("date", yesterdayStr)
            .maybeSingle();

        let newStreakDays = tracker.streak_days || 0;

        // Streak logic:
        // - If today is active and yesterday was active: increment
        // - If today is active and yesterday was not active: reset to 1
        // - If today is not active and yesterday was active: check if it's past midnight (reset to 0)
        // - If today is not active and yesterday was not active: keep at 0
        
        if (isTodayActive) {
            if (yesterdayLog?.is_active) {
                // Continue streak - only increment if not already incremented today
                if (tracker.last_streak_check !== todayStr) {
                    newStreakDays = (tracker.streak_days || 0) + 1;
                }
            } else {
                // Start new streak
                newStreakDays = 1;
            }
        } else {
            // Today not active yet
            if (yesterdayLog?.is_active === false || !yesterdayLog) {
                // Yesterday was also inactive or doesn't exist
                newStreakDays = 0;
            } else if (yesterdayLog?.is_active) {
                // Yesterday was active but today isn't yet
                // Check if we've passed midnight (streak at risk)
                const lastCheck = tracker.last_streak_check;
                if (lastCheck && lastCheck !== todayStr) {
                    // It's a new day and streak hasn't been activated - reset
                    newStreakDays = 0;
                }
            }
        }

        // Update tracker with new streak count and last check date
        const { error: updateError } = await supabase
            .from("trackers")
            .update({
                streak_days: newStreakDays,
                last_streak_check: todayStr
            })
            .eq("id", trackerId);

        if (updateError) {
            console.error("Error updating streak:", updateError);
            return { success: false, error: updateError.message };
        }

        return {
            success: true,
            streakActive: isTodayActive,
            streakDays: newStreakDays,
            todayLog: todayLog
        };

    } catch (err) {
        console.error("Streak check error:", err);
        return { success: false, error: err.message };
    }
}

// -----------------------------------------------------------------------------
// ACTIVATE STREAK (Called after a deposit meets minimum requirement)
// -----------------------------------------------------------------------------
export async function activateStreak(trackerId, depositAmount) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return { success: false, error: "No user logged in" };
        }

        // Get tracker details
        const { data: tracker, error: trackerError } = await supabase
            .from("trackers")
            .select("streak_enabled, streak_min_amount")
            .eq("id", trackerId)
            .single();

        if (trackerError || !tracker) {
            return { success: false, error: "Tracker not found" };
        }

        if (!tracker.streak_enabled) {
            return { success: false, error: "Streak not enabled for this tracker" };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        // Check if already activated today
        const { data: existingLog } = await supabase
            .from("streak_logs")
            .select("*")
            .eq("tracker_id", trackerId)
            .eq("user_id", userId)
            .eq("date", todayStr)
            .maybeSingle();

        if (existingLog?.is_active) {
            return { 
                success: true, 
                alreadyActive: true,
                message: "Streak already activated today" 
            };
        }

        // Calculate total deposited today (including this deposit)
        const totalToday = (existingLog?.amount_deposited || 0) + depositAmount;

        // Check if minimum is met
        const minAmount = tracker.streak_min_amount || 0;
        const meetsMinimum = totalToday >= minAmount;

        // Upsert the streak log
        const { error: logError } = await supabase
            .from("streak_logs")
            .upsert({
                tracker_id: trackerId,
                user_id: userId,
                date: todayStr,
                amount_deposited: totalToday,
                is_active: meetsMinimum,
                activated_at: meetsMinimum ? new Date().toISOString() : null
            }, {
                onConflict: 'tracker_id,user_id,date'
            });

        if (logError) {
            console.error("Error updating streak log:", logError);
            return { success: false, error: logError.message };
        }

        // Now update the tracker's streak count
        await checkAndUpdateStreak(trackerId);

        return {
            success: true,
            streakActivated: meetsMinimum,
            totalToday: totalToday,
            minimumRequired: minAmount,
            message: meetsMinimum 
                ? "Streak activated for today!" 
                : `Deposited $${totalToday.toFixed(2)} of $${minAmount.toFixed(2)} required`
        };

    } catch (err) {
        console.error("Activate streak error:", err);
        return { success: false, error: err.message };
    }
}

// -----------------------------------------------------------------------------
// GET TODAY'S STREAK STATUS
// -----------------------------------------------------------------------------
export async function getTodayStreakStatus(trackerId) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return { success: false, error: "No user logged in" };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        const { data, error } = await supabase
            .from("streak_logs")
            .select("*")
            .eq("tracker_id", trackerId)
            .eq("user_id", userId)
            .eq("date", todayStr)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') {
            return { success: false, error: error.message };
        }

        return {
            success: true,
            isActive: data?.is_active || false,
            amountDeposited: data?.amount_deposited || 0,
            activatedAt: data?.activated_at
        };

    } catch (err) {
        console.error("Get streak status error:", err);
        return { success: false, error: err.message };
    }
}

// -----------------------------------------------------------------------------
// DELETE STREAK DATA FOR A TRACKER
// Called when disabling streaks on a tracker
// -----------------------------------------------------------------------------
export async function deleteTrackerStreakData(trackerId) {
    try {
        if (!trackerId) {
            return { success: false, error: "Tracker ID is required" };
        }

        // Delete all streak logs for this tracker
        const { error: logsError } = await supabase
            .from("streak_logs")
            .delete()
            .eq("tracker_id", trackerId);

        if (logsError) {
            console.error("Error deleting streak logs:", logsError);
            return { success: false, error: logsError.message };
        }

        // Reset streak-related fields in the tracker
        const { error: trackerError } = await supabase
            .from("trackers")
            .update({
                streak_days: 0,
                last_streak_check: null
            })
            .eq("id", trackerId);

        if (trackerError) {
            console.error("Error resetting tracker streak fields:", trackerError);
            return { success: false, error: trackerError.message };
        }

        console.log("Streak data deleted successfully for tracker:", trackerId);
        return { success: true };

    } catch (err) {
        console.error("Delete streak data error:", err);
        return { success: false, error: err.message };
    }
}


