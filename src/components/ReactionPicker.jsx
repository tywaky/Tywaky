import React from 'react';

const reactions = [
    { type: 'like', label: 'Gosto', icon: '/reactions/like.png' },
    { type: 'love', label: 'Adoro', icon: '/reactions/love.png' },
    { type: 'care', label: 'Força', icon: '/reactions/care.png' },
    { type: 'haha', label: 'Riso', icon: '/reactions/haha.png' },
    { type: 'wow', label: 'Uau', icon: '/reactions/wow.png' },
    { type: 'sad', label: 'Triste', icon: '/reactions/sad.png' },
    { type: 'angry', label: 'Grrr', icon: '/reactions/angry.png' },
];

const ReactionPicker = ({ onSelect, onClose }) => {
    return (
        <div className="reaction-picker glass" onMouseLeave={onClose}>
            {reactions.map((reaction) => (
                <div
                    key={reaction.type}
                    className="reaction-icon-wrapper"
                    onClick={() => onSelect(reaction.type)}
                    title={reaction.label}
                >
                    <img src={reaction.icon} alt={reaction.label} className="reaction-icon-img" />
                    <span className="reaction-label">{reaction.label}</span>
                </div>
            ))}
        </div>
    );
};

export default ReactionPicker;
export { reactions };
