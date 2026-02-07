import { Mail, MessageCircle, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import './UserProfile.css';

interface UserProfileProps {
    name: string;
    email: string;
}

function UserProfile({ name, email }: UserProfileProps) {
    const [isOpen, setIsOpen] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);

    // Get user's initial for avatar
    const initial = name ? name.charAt(0).toUpperCase() : 'U';

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSendQuery = () => {
        const subject = encodeURIComponent('Real-estate QUERY 🏠📧🏡');
        // Use Gmail compose URL to open in browser instead of mail app
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}`;
        window.open(gmailUrl, '_blank');
        setIsOpen(false);
    };

    return (
        <div className="user-profile-container" ref={popupRef}>
            {/* Profile Avatar Button - Google-style circle with initial */}
            <button
                className="profile-avatar-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="User Profile"
                title={`${name} - Click to contact`}
            >
                <span className="avatar-initial">{initial}</span>
            </button>

            {/* Profile Popup */}
            {isOpen && (
                <div className="user-profile-popup">
                    <div className="popup-header">
                        <h4>Contact Owner</h4>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>
                            <X size={16} />
                        </button>
                    </div>
                    <div className="profile-content">
                        <div className="avatar-large">
                            <span>{initial}</span>
                        </div>
                        <div className="profile-info">
                            <h4 className="profile-name">{name}</h4>
                            <p className="profile-email">
                                <Mail size={14} />
                                {email}
                            </p>
                        </div>
                    </div>
                    <button className="query-btn" onClick={handleSendQuery}>
                        <MessageCircle size={16} />
                        Send Query via Gmail
                    </button>
                </div>
            )}
        </div>
    );
}

export default UserProfile;
