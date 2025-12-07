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
        .order("highest_streak_days", { ascending: false })
        .limit(1)
        .maybeSingle();
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
        const userId = await getCurrentUserId();
        
        if (!userId) {
            throw new Error("No user is currently logged in. Please log in first.");
        }

        const { data: ownerProfile, error: ownerProfileError } = await getUserProfile(userId);
        if (ownerProfileError || !ownerProfile || !ownerProfile.username) {
            throw new Error("Could not fetch owner profile or username.");
        }

        console.log("Creating tracker for user ID:", userId);

        // Insert into trackers table
        const { data: trackerData, error: trackerErr } = await supabase
            .from("trackers")
            .insert([
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
                    goal_date: goalDate || null,
                    streak_days: 0
                }
            ])
            .select()
            .single();

        if (trackerErr) throw trackerErr;

        const trackerId = trackerData.id;
        console.log("Tracker created successfully with ID:", trackerId);

        // Create initial streak record if enabled
        if (streakEnabled && streakMinAmount) {
            const streakResult = await createTrackerStreak(trackerId, streakMinAmount);
            if (!streakResult.success) {
                console.warn("Failed to create initial streak:", streakResult.error);
            }
        }

        // Manage contributors
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
    wasStreakEnabled
}) {
    try {
        if (!trackerId) {
            throw new Error("Tracker ID is required for update.");
        }

        const currentUserId = await getCurrentUserId();
        if (!currentUserId) {
            throw new Error("User session expired. Please log in again.");
        }
        
        // Owner check
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

        // Handle streak changes
        if (wasStreakEnabled && !streakEnabled) {
            // Case 1: Disabling streaks (explicit toggle OFF)
            console.log("Streaks disabled - marking current streak as lost...");
            const markResult = await markStreakAsLost(trackerId);
            if (!markResult.success) {
                console.warn("Failed to mark streak as lost:", markResult.error);
            }
        } else if (streakEnabled && wasStreakEnabled && streakMinAmount !== trackerDataCheck.streak_min_amount) {
            // Case 2: Streak is ON, and minimum amount has changed (reset required)
            // Note: trackerDataCheck.streak_min_amount is the value before update.
            console.log("Streak minimum amount changed, marking old streak as lost and creating new one...");
            await markStreakAsLost(trackerId);
            await createTrackerStreak(trackerId, streakMinAmount);
        } else if (!wasStreakEnabled && streakEnabled) {
            // Case 3: Enabling streaks (explicit toggle ON)
            console.log("Streaks enabled - creating new streak record...");
            const createResult = await createTrackerStreak(trackerId, streakMinAmount);
            if (!createResult.success) {
                console.warn("Failed to create new streak:", createResult.error);
            }
        }

        // Clean up and compare min amount values
        const currentTrackerMinAmount = parseFloat(trackerDataCheck.streak_min_amount) || null;
        const newStreakMinAmount = streakEnabled && streakMinAmount ? parseFloat(streakMinAmount) : null;
        const minAmountChanged = streakEnabled && wasStreakEnabled && (currentTrackerMinAmount !== newStreakMinAmount);
        
        let shouldResetTrackerStreakDays = false;

        // Handle streak changes
        if (wasStreakEnabled && !streakEnabled) {
            // Disabling streaks - mark current streak as lost
            console.log("Streaks disabled - marking current streak as lost...");
            const markResult = await markStreakAsLost(trackerId);
            if (!markResult.success) {
                console.warn("Failed to mark streak as lost:", markResult.error);
            }
        } else if (minAmountChanged) {
            // Streak settings changed (minimum amount) - mark old as lost, create new
            console.log("Streak settings changed (min amount) - marking old as lost and creating new...");
            await markStreakAsLost(trackerId);
            await createTrackerStreak(trackerId, newStreakMinAmount);
            shouldResetTrackerStreakDays = true; // Flag for display reset
        } else if (!wasStreakEnabled && streakEnabled) {
            // Enabling streaks - create new streak record
            console.log("Streaks enabled - creating new streak record...");
            const createResult = await createTrackerStreak(trackerId, newStreakMinAmount);
            if (!createResult.success) {
                console.warn("Failed to create new streak:", createResult.error);
            }
            shouldResetTrackerStreakDays = true; // Flag for display reset
        }

        const { data: ownerProfile, error: ownerProfileError } = await getUserProfile(currentUserId);
        if (ownerProfileError || !ownerProfile || !ownerProfile.username) {
            throw new Error("Could not fetch owner profile or username.");
        }

        console.log("Updating tracker with ID:", trackerId);

        // Prepare the update payload
        const updatePayload = {
            tracker_name: trackerName,
            description,
            bank_name: bankName,
            interest_rate: interestRate,
            streak_enabled: streakEnabled,
            streak_min_amount: streakEnabled ? newStreakMinAmount : null,
            goal_enabled: goalEnabled,
            goal_amount: goalAmount,
            min_daily_amount: minDailyAmount,
            goal_date: goalDate || null
        };
        
        // Final streak_days reset for display if a new streak was started/reset
        if (shouldResetTrackerStreakDays) {
            updatePayload.streak_days = 0;
        }

        // Update trackers table
        const { data: trackerData, error: trackerErr } = await supabase
            .from("trackers")
            .update(updatePayload)
            .eq("id", trackerId)
            .select()
            .single();

        if (trackerErr) throw trackerErr;
        
        // Manage contributors
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

        if (logError && logError.code !== 'PGRST116') {
            console.error("Error checking today's streak log:", logError);
        }

        const isTodayActive = todayLog?.is_active || false;

        // Check yesterday's status
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

        // CORRECTED STREAK LOGIC:
        if (isTodayActive) {
            // Today's streak is active
            if (tracker.last_streak_check === todayStr) {
                // Already checked today, keep current count
                newStreakDays = tracker.streak_days || 1;
            } else {
                // First time activating today
                if (yesterdayLog?.is_active) {
                    // Yesterday was active - increment streak
                    newStreakDays = (tracker.streak_days || 0) + 1;
                } else {
                    // Yesterday was not active - start new streak
                    newStreakDays = 1;
                }
            }
        } else {
            // Today not active yet
            if (!yesterdayLog || yesterdayLog.is_active === false) {
                // Yesterday was also inactive - keep at 0
                newStreakDays = 0;
            } else if (yesterdayLog.is_active && tracker.last_streak_check !== todayStr) {
                // Yesterday was active but today isn't - streak broken, reset to 0
                newStreakDays = 0;
            } else {
                // Keep current streak (waiting for today's deposit)
                newStreakDays = tracker.streak_days || 0;
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
// CREATE NEW STREAK FOR TRACKER
// Called when enabling streaks on a tracker or when starting fresh
// -----------------------------------------------------------------------------
export async function createTrackerStreak(trackerId, streakMinAmount) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return { success: false, error: "No user logged in" };
        }

        // Check if an ongoing streak already exists
        const { data: existing } = await supabase
            .from("streaks")
            .select("id")
            .eq("tracker_id", trackerId)
            .eq("user_id", userId)
            .eq("status", "ongoing")
            .maybeSingle();

        if (existing) {
            // Update existing streak with new minimum
            const { error: updateError } = await supabase
                .from("streaks")
                .update({ streak_min_amount: streakMinAmount })
                .eq("id", existing.id);

            if (updateError) {
                return { success: false, error: updateError.message };
            }

            return { success: true, streakId: existing.id, isNew: false };
        }

        // Create new streak record
        const { data: newStreak, error: insertError } = await supabase
            .from("streaks")
            .insert({
                tracker_id: trackerId,
                user_id: userId,
                streak_min_amount: streakMinAmount,
                status: "ongoing",
                is_active_today: false,
                streak_days: 0,
                highest_streak_days: 0,
                highest_streak_balance: 0
            })
            .select()
            .single();

        if (insertError) {
            console.error("Error creating streak:", insertError);
            return { success: false, error: insertError.message };
        }

        console.log("New streak created:", newStreak.id);
        return { success: true, streakId: newStreak.id, isNew: true };

    } catch (err) {
        console.error("Create streak error:", err);
        return { success: false, error: err.message };
    }
}

// -----------------------------------------------------------------------------
// MARK STREAK AS LOST
// Called when disabling streaks or when editing streak settings
// Updates the status to 'lost' and records the final days achieved
// -----------------------------------------------------------------------------
export async function markStreakAsLost(trackerId) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return { success: false, error: "No user logged in" };
        }

        // Find ongoing streak
        const { data: streak, error: findError } = await supabase
            .from("streaks")
            .select("*")
            .eq("tracker_id", trackerId)
            .eq("user_id", userId)
            .eq("status", "ongoing")
            .maybeSingle();

        if (findError || !streak) {
            return { success: true, message: "No ongoing streak to mark as lost" };
        }

        // Update streak status to 'lost'
        const { error: updateError } = await supabase
            .from("streaks")
            .update({
                status: "lost",
                updated_at: new Date().toISOString()
            })
            .eq("id", streak.id);

        if (updateError) {
            console.error("Error marking streak as lost:", updateError);
            return { success: false, error: updateError.message };
        }

        console.log(`Streak ${streak.id} marked as lost with ${streak.streak_days} days`);
        return {
            success: true,
            streakId: streak.id,
            daysAchieved: streak.streak_days
        };

    } catch (err) {
        console.error("Mark streak as lost error:", err);
        return { success: false, error: err.message };
    }
}

// -----------------------------------------------------------------------------
// DELETE ALL STREAK DATA FOR TRACKER
// Called when completely removing streak feature
// -----------------------------------------------------------------------------
export async function deleteTrackerStreakData(trackerId) {
    try {
        if (!trackerId) {
            return { success: false, error: "Tracker ID is required" };
        }

        const userId = await getCurrentUserId();
        if (!userId) {
            return { success: false, error: "No user logged in" };
        }

        // Delete all streak records for this tracker and user
        const { error: deleteError } = await supabase
            .from("streaks")
            .delete()
            .eq("tracker_id", trackerId)
            .eq("user_id", userId);

        if (deleteError) {
            console.error("Error deleting streak data:", deleteError);
            return { success: false, error: deleteError.message };
        }

        console.log("All streak data deleted for tracker:", trackerId);
        return { success: true };

    } catch (err) {
        console.error("Delete streak data error:", err);
        return { success: false, error: err.message };
    }
}

// -----------------------------------------------------------------------------
// GET STREAK HISTORY FOR TRACKER
// Fetches all streaks (ongoing and lost) for display purposes
// -----------------------------------------------------------------------------
export async function getStreakHistory(trackerId) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return { data: [], error: "No user logged in" };
        }

        const { data, error } = await supabase
            .from("streaks")
            .select("*")
            .eq("tracker_id", trackerId)
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching streak history:", error);
            return { data: [], error: error.message };
        }

        return { data: data || [], error: null };

    } catch (err) {
        console.error("Get streak history error:", err);
        return { data: [], error: err.message };
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

        // Call the RPC function that handles streak activation
        const { data, error } = await supabase.rpc('activate_streak_for_deposit', {
            p_tracker_id: trackerId,
            p_user_id: userId,
            p_deposit_amount: depositAmount
        });

        if (error) {
            console.error("Activate streak RPC error:", error);
            return { success: false, error: error.message };
        }

        return {
            success: true,
            streakActivated: data?.streak_activated || false,
            newStreakDays: data?.new_streak_days || 0,
            message: data?.message || "Streak processed"
        };

    } catch (err) {
        console.error("Activate streak error:", err);
        return { success: false, error: err.message };
    }
}

// -----------------------------------------------------------------------------
// GET TODAY'S STREAK STATUS
//
// -----------------------------------------------------------------------------
export async function getTodayStreakStatus(trackerId) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return { success: false, error: "No user logged in" };
        }

        // 1. Get the tracker to find the owner_id
        const { data: tracker, error: trackerError } = await supabase
            .from("trackers")
            .select("owner_id")
            .eq("id", trackerId)
            .single();

        if (trackerError || !tracker) {
            return { success: false, error: trackerError?.message || "Tracker not found" };
        }
        
        const ownerId = tracker.owner_id;

        // 2. Get the active/ongoing streak for this tracker, specifically using the OWNER'S ID
        const { data: streak, error: streakQueryError } = await supabase
            .from("streaks")
            .select("*")
            .eq("tracker_id", trackerId)
            .eq("user_id", ownerId) // <--- KEY CHANGE: Check the owner's record for shared status
            .eq("status", "ongoing")
            .maybeSingle();

        if (streakQueryError && streakQueryError.code !== 'PGRST116') {
            console.error("Error fetching streak:", streakQueryError);
            return { success: false, error: streakQueryError.message };
        }

        // If no ongoing streak exists for the owner (master record), return inactive
        if (!streak) {
            return {
                success: true,
                isActive: false,
                streakDays: 0,
                message: "No active streak"
            };
        }

        return {
            success: true,
            isActive: streak.is_active_today || false,
            streakDays: streak.streak_days || 0,
            highestStreak: streak.highest_streak_days || 0,
            streakId: streak.id
        };

    } catch (err) {
        console.error("Get streak status error:", err);
        return { success: false, error: err.message };
    }
}

// -----------------------------------------------------------------------------
// SIMULATE NEXT DAY (DEVELOPMENT ONLY)
// Advances all streak_logs dates by 1 day for testing purposes
// This helps test streak logic without waiting for real days to pass
// -----------------------------------------------------------------------------
export async function simulateNextDay() {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return { success: false, error: "No user logged in" };
        }

        // Call the RPC function that handles the day simulation
        const { data, error } = await supabase.rpc('simulate_next_day', {
            p_user_id: userId
        });

        if (error) {
            console.error("Simulate next day error:", error);
            return { success: false, error: error.message };
        }

        console.log("Day simulation successful:", data);
        return { 
            success: true, 
            newDate: data,
            message: "Advanced to next day successfully"
        };

    } catch (err) {
        console.error("Simulate next day error:", err);
        return { success: false, error: err.message };
    }
}

// -----------------------------------------------------------------------------
// FETCH ALL USER AGGREGATED STATISTICS (RPC)
// -----------------------------------------------------------------------------
export async function getUserSavingsStatistics(userId = null) {
    let targetUserId = userId;
    
    // If no userId provided, fetch current user's ID
    if (!targetUserId) {
        targetUserId = await getCurrentUserId();
    }
    
    if (!targetUserId) {
        return { data: null, error: { message: "No user ID available" } };
    }

    try {
        const { data, error } = await supabase.rpc('get_user_savings_statistics', {
            p_user_id: targetUserId
        });

        if (error) {
            console.error("RPC get_user_savings_statistics error:", error.message);
            return { data: null, error: error.message };
        }

        return { data: data || null, error: null };

    } catch (err) {
        console.error("Get user statistics error:", err.message);
        return { data: null, error: err.message };
    }
}

// -----------------------------------------------------------------------------
// HELPER: Format streak days with correct singular/plural 'day/days'
// -----------------------------------------------------------------------------
export function formatStreakDays(days) {
    const count = parseInt(days) || 0;
    const unit = count === 1 ? 'day' : 'days';
    return `${count} ${unit}`;
}

// Helper function to convert streak days to a badge name
export function getStreakBadge(days) {
    if (days >= 500) return { name: "Mythical", emoji: "✨" };
    if (days >= 250) return { name: "Diamond", emoji: "💎" };
    if (days >= 200) return { name: "Ruby", emoji: "🔴" };
    if (days >= 150) return { name: "Gold", emoji: "🛡️" };
    if (days >= 100) return { name: "Platinum", emoji: "🥇" };
    if (days >= 50) return { name: "Silver", emoji: "🥈" };
    if (days >= 10) return { name: "Bronze", emoji: "🥉" };
    if (days >= 3) return { name: "Wood", emoji: "🪵" };
    return { name: "casual saver", emoji: "" };
}