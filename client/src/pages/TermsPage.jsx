// TermsAndConditions.jsx
// -----------------------------------------------------------------------------
// PRIMARY FUNCTION:
// Provides a static Terms & Conditions page for the SaveIt application.
// This component is purely informational and contains no dynamic logic,
// except for the auto-updated copyright year.
// -----------------------------------------------------------------------------
// FEATURES:
//    • Fully responsive container layout
//    • Structured legal content with headings
//    • Clean readability-focused UI styling
// -----------------------------------------------------------------------------

function TermsAndConditions() {

    // Auto-generate current year for footer
    const currentYear = new Date().getFullYear();

    return (
        <>
            <div className="flex min-h-screen min-w-screen justify-center items-center py-10 overflow-x-hidden gradient-bg">
                <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-10">

                    {/* PAGE TITLE */}
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                        Terms and Conditions
                    </h2>

                    {/* INTRODUCTION ------------------------------------------------ */}
                    <p className="text-gray-700 mb-4">
                        Welcome to SaveIt. By accessing or using our service, you agree to comply
                        with and be bound by these terms and conditions.
                    </p>

                    {/* SECTION 1 --------------------------------------------------- */}
                    <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-2">
                        1. Use of Service
                    </h3>
                    <p className="text-gray-700 mb-4">
                        You agree to use the service only for lawful purposes. You must not misuse
                        the service in any way, including but not limited to violating any applicable
                        laws or regulations.
                    </p>

                    {/* SECTION 2 --------------------------------------------------- */}
                    <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-2">
                        2. Account Responsibilities
                    </h3>
                    <p className="text-gray-700 mb-4">
                        If you create an account, you are responsible for maintaining the
                        confidentiality of your account information, including your password. You
                        are responsible for all activities that occur under your account.
                    </p>

                    {/* SECTION 3 --------------------------------------------------- */}
                    <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-2">
                        3. Intellectual Property
                    </h3>
                    <p className="text-gray-700 mb-4">
                        All content provided in this service, including text, graphics, logos, and
                        software, is the property of SaveIt or its licensors and is protected by
                        applicable intellectual property laws. You may not reproduce, distribute,
                        or create derivative works without explicit permission.
                    </p>

                    {/* SECTION 4 --------------------------------------------------- */}
                    <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-2">
                        4. Privacy and Data Collection
                    </h3>
                    <p className="text-gray-700 mb-4">
                        We may collect personal information such as your name, email address, and
                        usage activity to provide and improve our services. By using the service,
                        you consent to the collection and use of information as outlined in our
                        Privacy Policy. We do not sell or share your data with third parties except
                        where required by law or necessary to operate the service.
                    </p>

                    {/* SECTION 5 --------------------------------------------------- */}
                    <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-2">
                        5. User Content
                    </h3>
                    <p className="text-gray-700 mb-4">
                        Any content you upload or submit remains your property, but you grant us a
                        non-exclusive, worldwide, royalty-free license to use, store, and display
                        your content for the purpose of operating and improving the service. You
                        are responsible for ensuring that your content does not violate any laws or
                        infringe on the rights of others.
                    </p>

                    {/* SECTION 6 --------------------------------------------------- */}
                    <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-2">
                        6. Prohibited Activities
                    </h3>
                    <p className="text-gray-700 mb-4">
                        You agree not to engage in activities such as attempting to gain
                        unauthorized access to the service, interfering with its performance,
                        distributing harmful software, or using the platform for fraudulent,
                        misleading, or malicious purposes.
                    </p>

                    {/* SECTION 7 --------------------------------------------------- */}
                    <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-2">
                        7. Third-Party Links
                    </h3>
                    <p className="text-gray-700 mb-4">
                        Our service may contain links to third-party websites or services that are
                        not controlled or operated by us. We are not responsible for the content,
                        policies, or practices of third-party platforms and encourage you to review
                        their terms before interacting with them.
                    </p>

                    {/* SECTION 8 --------------------------------------------------- */}
                    <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-2">
                        8. Limitation of Liability
                    </h3>
                    <p className="text-gray-700 mb-4">
                        We are not liable for any direct, indirect, incidental, or consequential
                        damages arising from your use of the service. Your use of the service is at
                        your own risk. We do not guarantee uninterrupted, error-free, or secure
                        access to the platform.
                    </p>

                    {/* SECTION 9 --------------------------------------------------- */}
                    <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-2">
                        9. Termination
                    </h3>
                    <p className="text-gray-700 mb-4">
                        We reserve the right to suspend or terminate your access to the service at
                        any time if we determine that you have violated these terms or engaged in
                        harmful behavior. You may discontinue use of the service at any time by
                        deleting your account.
                    </p>

                    {/* SECTION 10 -------------------------------------------------- */}
                    <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-2">
                        10. Changes to Terms
                    </h3>
                    <p className="text-gray-700 mb-4">
                        We may modify these terms at any time. Updates will be posted on this page,
                        and your continued use of the service constitutes acceptance of the updated
                        terms.
                    </p>

                    {/* SECTION 11 -------------------------------------------------- */}
                    <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-2">
                        11. Governing Law
                    </h3>
                    <p className="text-gray-700 mb-4">
                        These terms are governed by the laws of your local jurisdiction. Any
                        disputes arising from the use of the service will be resolved through
                        appropriate legal channels in accordance with applicable law.
                    </p>

                    {/* SECTION 12 -------------------------------------------------- */}
                    <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-2">
                        12. Contact Us
                    </h3>
                    <p className="text-gray-700 mb-4">
                        If you have any questions about these terms, please contact us at{" "}
                        <span className="text-blue-600">support@saveit.com</span>.
                    </p>

                    {/* FOOTER ------------------------------------------------------ */}
                    <p className="text-gray-500 text-sm mt-6 text-center">
                        © {currentYear} SaveIt Technologies. All rights reserved.
                    </p>

                </div>
            </div>
        </>
    );
}

export default TermsAndConditions;
