import React, { useState } from 'react';
import { FiShield, FiAlertCircle, FiLock, FiX } from 'react-icons/fi';

function PrivacyPolicy() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Clickable Privacy Policy link shown at the bottom of login & signup */}
            <div className="text-center py-2 text-xs text-gray-400 select-none">
                <span>By continuing, you acknowledge our </span>
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="text-indigo-400 hover:text-indigo-300 underline font-semibold transition-colors cursor-pointer"
                >
                    Privacy Policy
                </button>
            </div>

            {/* Privacy Policy Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-sm animate-fade-in"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="bg-[#1A1D29] border border-gray-800 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 md:px-7 py-4 border-b border-gray-800 bg-[#12141C]/80 shrink-0">
                            <div className="flex items-center gap-2.5 text-indigo-400">
                                <div className="p-2 rounded-xl bg-indigo-500/10">
                                    <FiShield className="text-2xl shrink-0" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white leading-tight">Privacy Policy</h2>
                                    <p className="text-[11px] text-gray-400">Last updated: October 27, 2026</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                                title="Close"
                            >
                                <FiX className="text-xl" />
                            </button>
                        </div>

                        {/* Scrollable Policy Content */}
                        <div className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6 text-gray-300 text-sm leading-relaxed hide-scrollbar select-text">
                            
                            {/* Section 1 */}
                            <div className="space-y-2">
                                <h3 className="text-base font-bold text-white">
                                    1. Introduction
                                </h3>
                                <p>Welcome to our Chat Application.</p>
                                <p>
                                    This application is a personal portfolio project developed to demonstrate full-stack web development, user authentication, and real-time messaging capabilities.
                                </p>
                                <p>
                                    This Privacy Policy explains what information may be collected when you use the application, how that information is used, and how it is handled.
                                </p>
                                <p>
                                    By using this application, you acknowledge that you have read this Privacy Policy.
                                </p>
                            </div>

                            {/* Section 2 */}
                            <div className="space-y-2">
                                <h3 className="text-base font-bold text-white">
                                    2. Information We Collect
                                </h3>
                                <p>Depending on how you use the application, the following information may be collected or stored:</p>
                                <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-300">
                                    <li>
                                        <strong className="text-gray-100">Account Information:</strong> Username, email address, and password credentials used to create and access your account.
                                    </li>
                                    <li>
                                        <strong className="text-gray-100">Profile Information:</strong> Profile picture, avatar, or other profile details you choose to provide.
                                    </li>
                                    <li>
                                        <strong className="text-gray-100">Messages:</strong> Messages you send or receive through the application.
                                    </li>
                                    <li>
                                        <strong className="text-gray-100">Technical Information:</strong> Certain technical information may be processed by the application or its hosting providers to operate, maintain, and secure the service.
                                    </li>
                                </ul>
                                <p className="pt-1">
                                    Passwords should be stored using secure password hashing rather than as readable plain text.
                                </p>
                                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2 mt-2">
                                    <FiAlertCircle className="text-base shrink-0" />
                                    <span>Please do not submit sensitive personal information through this demo application.</span>
                                </div>
                            </div>

                            {/* Section 3 */}
                            <div className="space-y-2">
                                <h3 className="text-base font-bold text-white">
                                    3. How We Use Your Information
                                </h3>
                                <p>Information processed by the application may be used to:</p>
                                <ul className="list-disc list-inside space-y-1 pl-2 text-gray-300">
                                    <li>Create and manage user accounts.</li>
                                    <li>Authenticate users and protect account access.</li>
                                    <li>Display user profiles and avatars.</li>
                                    <li>Send and receive messages in real time.</li>
                                    <li>Maintain the application's functionality.</li>
                                    <li>Identify technical problems and help prevent misuse.</li>
                                </ul>
                                <p className="pt-1 text-gray-400 text-xs">
                                    We do not need your information for advertising purposes to demonstrate the application's core functionality.
                                </p>
                            </div>

                            {/* Section 4 */}
                            <div className="space-y-2">
                                <h3 className="text-base font-bold text-white">
                                    4. Messages and Privacy
                                </h3>
                                <p>
                                    The application allows registered users to discover other users and communicate through the messaging system.
                                </p>
                                <p>
                                    Messages are processed to provide chat functionality and may be stored in the application's database.
                                </p>
                                <p>
                                    Your messages should only be accessible to their intended participants through the application's authorized interfaces. However, this is a portfolio demo and should not be treated as a secure channel for confidential communication.
                                </p>
                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2 mt-2 font-medium">
                                    <FiLock className="text-base shrink-0" />
                                    <span>Please do not use this application to share passwords, financial information, confidential documents, or other sensitive information.</span>
                                </div>
                                <p className="pt-1 text-gray-400 text-xs">
                                    Unless explicitly implemented and verified, the application should not be considered end-to-end encrypted.
                                </p>
                            </div>

                            {/* Section 5 */}
                            <div className="space-y-2">
                                <h3 className="text-base font-bold text-white">
                                    5. Data Storage and Third-Party Services
                                </h3>
                                <p>
                                    The application may use third-party services to host its frontend and backend, store database records, or store uploaded images.
                                </p>
                                <p>
                                    These services may process information as necessary to provide their infrastructure and services.
                                </p>
                                <p>The actual providers used by this application include:</p>
                                <ul className="list-disc list-inside space-y-1 pl-2 text-gray-300">
                                    <li><strong className="text-gray-100">Frontend Hosting:</strong> Render / Netlify / Vercel</li>
                                    <li><strong className="text-gray-100">Backend Hosting:</strong> Render</li>
                                    <li><strong className="text-gray-100">Database:</strong> MongoDB Atlas</li>
                                    <li><strong className="text-gray-100">Image Storage:</strong> Local SVG Pixel Generator</li>
                                </ul>
                                <p className="pt-1 text-xs text-gray-400">
                                    Please review the privacy policies of the applicable providers to understand their data-handling practices.
                                </p>
                            </div>

                            {/* Section 6 */}
                            <div className="space-y-2">
                                <h3 className="text-base font-bold text-white">
                                    6. Data Sharing
                                </h3>
                                <p>We do not intentionally sell users' personal information.</p>
                                <p>
                                    Information may be processed by the third-party infrastructure providers used to operate the application.
                                </p>
                                <p>
                                    Information may also be disclosed when required by applicable law or when reasonably necessary to protect the application's security and prevent misuse.
                                </p>
                            </div>

                            {/* Section 7 */}
                            <div className="space-y-2">
                                <h3 className="text-base font-bold text-white">
                                    7. Data Security
                                </h3>
                                <p>
                                    Reasonable measures should be used to protect information handled by the application, including secure authentication, password hashing, access controls, and encrypted connections where supported.
                                </p>
                                <p>
                                    However, no internet application or electronic storage system can be guaranteed to be completely secure.
                                </p>
                                <p className="text-xs text-amber-300/90 font-medium">
                                    Because this application is a portfolio demo, you should not rely on it to store confidential or highly sensitive information.
                                </p>
                            </div>

                            {/* Section 8 */}
                            <div className="space-y-2">
                                <h3 className="text-base font-bold text-white">
                                    8. Data Retention and Deletion
                                </h3>
                                <p>
                                    Account information and messages may remain stored while the relevant records are retained in the application's database.
                                </p>
                                <p>
                                    If you want to delete your account you can delete it from your account settings.
                                    Note: once your account is deleted, it cannot be recovered.
                                </p>
                               
                            </div>

                        
                          

                            {/* Section 9 */}
                            <div className="space-y-2">
                                <h3 className="text-base font-bold text-white">
                                    9. Changes to This Privacy Policy
                                </h3>
                                <p>
                                    This Privacy Policy may be updated when the application or its data-handling practices change.
                                </p>
                                <p>
                                    Any revised version will be published on this page with an updated revision date.
                                </p>
                            </div>

                            {/* Section 10 */}
                            <div className="space-y-3 border-t border-gray-800 pt-5">
                                <h3 className="text-base font-bold text-white">
                                    10. Contact Us
                                </h3>
                                <p>
                                    If you have questions about this Privacy Policy or wish to submit a privacy-related request, contact:
                                </p>
                                <div className="p-4 rounded-xl bg-[#12141C] border border-gray-800 text-xs space-y-1">
                                    <p><strong className="text-gray-300">Project:</strong> NexChat Application</p>
                                    <p><strong className="text-gray-300">Developer:</strong> Tarun</p>
                                    <p><strong className="text-gray-300">Email:</strong> tarunparmar2310@gmail.com</p>
                                </div>
                            </div>

                            {/* Sign-off */}
                            <div className="border-t border-gray-800 pt-4 text-center text-xs text-gray-500">
                                Thank you for trying this portfolio project.
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 md:px-7 py-3 border-t border-gray-800 bg-[#12141C]/80 flex justify-end shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer transition-colors shadow-md active:scale-95"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default PrivacyPolicy;
