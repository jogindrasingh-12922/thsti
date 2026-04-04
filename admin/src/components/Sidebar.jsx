import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Menu as MenuIcon, Settings, LogOut, LayoutTemplate, Image, FileText, Newspaper, ChevronRight, ChevronLeft, Languages, Beaker, Home, ChevronDown, Bell, Megaphone, Users, UserCircle, Globe, GraduationCap } from 'lucide-react';

export default function Sidebar() {
    const location = useLocation();
    const currentPath = location.pathname;

    // Initialize state from localStorage or default to false (expanded)
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('thsti_admin_sidebar_collapsed');
        return saved === 'true';
    });

    // Update localStorage when state changes
    useEffect(() => {
        localStorage.setItem('thsti_admin_sidebar_collapsed', isCollapsed);
    }, [isCollapsed]);

    const handleLogout = () => {
        localStorage.removeItem('thsti_admin_token');
        localStorage.removeItem('thsti_admin_user');
        window.location.href = '/';
    };

    const [isHomeMenuOpen, setIsHomeMenuOpen] = useState(true);

    // New state for hover flyout
    const [hoveredItemId, setHoveredItemId] = useState(null);
    const [flyoutAnchorRect, setFlyoutAnchorRect] = useState(null);
    const hoverTimeout = React.useRef(null);

    const handleItemEnter = (e, itemName) => {
        if (!isCollapsed) return;
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        const rect = e.currentTarget.getBoundingClientRect();
        setFlyoutAnchorRect(rect);
        setHoveredItemId(itemName);
    };

    const handleItemLeave = () => {
        if (!isCollapsed) return;
        hoverTimeout.current = setTimeout(() => {
            setHoveredItemId(null);
        }, 150);
    };

    const handleFlyoutEnter = () => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    };

    const handleFlyoutLeave = () => {
        hoverTimeout.current = setTimeout(() => {
            setHoveredItemId(null);
        }, 150);
    };

    // Close flyout on ESC key and Route change
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setHoveredItemId(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        setHoveredItemId(null);
    }, [currentPath]);

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Menu Config', path: '/dashboard/menus', icon: <MenuIcon size={20} /> },
        {
            name: 'Home Page',
            icon: <Home size={20} />,
            children: [
                { name: 'Hero Slider', path: '/dashboard/hero-slides', icon: <Image size={18} /> },
                { name: 'Home Sections', path: '/dashboard/sections', icon: <LayoutTemplate size={18} /> },
                { name: 'Research Centers', path: '/dashboard/research-centers', icon: <Beaker size={18} /> },
                { name: 'Research Facilities', path: '/dashboard/research-facilities', icon: <Beaker size={18} /> },
                { name: 'Programmes', path: '/dashboard/programmes', icon: <FileText size={18} /> },
                { name: 'Life on The THSTI', path: '/dashboard/life-at-thsti', icon: <LayoutTemplate size={18} /> },
            ]
        },
        { name: 'Pages', path: '/dashboard/pages', icon: <FileText size={20} /> },
        { name: 'Faculty', path: '/dashboard/faculty', icon: <GraduationCap size={20} /> },
        { name: 'News & Events', path: '/dashboard/news', icon: <Newspaper size={20} /> },
        { name: "Int'l Collaboration", path: '/dashboard/international-collaboration', icon: <Globe size={20} /> },
        { name: 'Media Library', path: '/dashboard/media', icon: <Image size={20} /> },
        { name: 'Languages', path: '/dashboard/languages', icon: <Languages size={20} /> },
        { name: 'Pre-Footer Strip', path: '/dashboard/pre-footer-links', icon: <LayoutTemplate size={20} /> },
        { name: 'Footer Links', path: '/dashboard/footer-links', icon: <LayoutTemplate size={20} /> },
        { name: "What's New (Marquee)", path: '/dashboard/marquee', icon: <Megaphone size={20} /> },
        { name: 'Notifications', path: '/dashboard/notifications', icon: <Bell size={20} /> },
        { name: 'Users', path: '/dashboard/users', icon: <Users size={20} /> },
        { name: 'My Profile', path: '/dashboard/profile', icon: <UserCircle size={20} /> },
        { name: 'Settings', path: '/dashboard/settings', icon: <Settings size={20} /> },
    ];

    // Check if any child of a given parent is currently active
    const isChildActive = (children) => {
        if (!children) return false;
        return children.some(child => currentPath.startsWith(child.path));
    };

    // Auto-expand Home Page if one of its children is active when component mounts or path changes
    useEffect(() => {
        const homePageItem = navItems.find(item => item.name === 'Home Page');
        if (homePageItem && isChildActive(homePageItem.children)) {
            setIsHomeMenuOpen(true);
        }
    }, [currentPath]);

    const isMatch = (path) => {
        if (path === '/dashboard') {
            return currentPath === '/dashboard';
        }
        return currentPath.startsWith(path);
    };

    return (
        <div
            className={`bg-white min-h-screen flex flex-col shrink-0 transition-all duration-300 ease-in-out border-r border-gray-200 relative z-20 ${isCollapsed ? 'w-[75px]' : 'w-[250px]'}`}
        >
            {/* Collapse Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-6 bg-white text-gray-700 rounded-full p-1 shadow-md border border-gray-200 hover:bg-gray-100 z-30 transition-colors focus:outline-none"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
                {isCollapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
            </button>

            {/* Header / Logo */}
            <div className={`flex items-center h-16 shrink-0 transition-all px-4 ${isCollapsed ? 'justify-center border-b border-gray-200' : 'border-b border-gray-200'}`}>
                {isCollapsed ? (
                    <div className="font-bold text-xl text-white tracking-widest bg-[var(--primary)] w-10 h-10 rounded flex items-center justify-center shadow-sm">T</div>
                ) : (
                    <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                        <div className="font-bold text-xl text-white tracking-widest bg-[var(--primary)] px-2 py-1 rounded shadow-sm">THSTI</div>
                        <span className="font-bold text-[var(--text-dark)] tracking-wide">ADMIN</span>
                    </div>
                )}
            </div>

            {/* Navigation Links */}
            <div className="flex-1 py-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
                <ul className="space-y-1.5 px-3">
                    {navItems.map((item, index) => {
                        if (item.children) {
                            const parentActive = isChildActive(item.children);

                            return (
                                <li
                                    key={item.name}
                                    className="relative group flex flex-col"
                                    onMouseEnter={(e) => handleItemEnter(e, item.name)}
                                    onMouseLeave={handleItemLeave}
                                    onFocus={(e) => handleItemEnter(e, item.name)}
                                    onBlur={handleItemLeave}
                                >
                                    <button
                                        onClick={() => setIsHomeMenuOpen(!isHomeMenuOpen)}
                                        title={isCollapsed ? item.name : undefined}
                                        className={`flex items-center justify-between py-2.5 px-3 rounded-md transition-all duration-200 
                                            ${parentActive ? 'bg-[var(--bg-light)] text-[var(--secondary)] font-semibold border-l-4 border-[var(--primary)] shadow-sm' : 'text-[var(--text-dark)] hover:bg-gray-100 hover:text-[var(--secondary)] font-medium'} 
                                            ${isCollapsed ? 'justify-center border-l-0 border-b-2 border-transparent hover:border-b-2' : ''} 
                                            ${isCollapsed && parentActive ? '!border-b-[var(--primary)] border-l-0 rounded-none' : ''}`}
                                    >
                                        <div className={`flex items-center gap-3 ${isCollapsed ? 'mx-auto' : ''}`}>
                                            <span className={`shrink-0 ${parentActive ? 'text-[var(--secondary)]' : 'text-gray-500 group-hover:text-[var(--secondary)] transition-colors'}`}>
                                                {item.icon}
                                            </span>
                                            {!isCollapsed && (
                                                <span className="truncate text-sm">
                                                    {item.name}
                                                </span>
                                            )}
                                        </div>
                                        {!isCollapsed && (
                                            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isHomeMenuOpen ? 'rotate-180' : ''}`} />
                                        )}
                                    </button>

                                    {/* Children Render */}
                                    {(!isCollapsed && isHomeMenuOpen) && (
                                        <ul className="mt-1 space-y-1 ml-[1.5rem] border-l-2 border-gray-100 pl-2">
                                            {item.children.map((child) => {
                                                const childActive = isMatch(child.path);
                                                return (
                                                    <li key={child.path}>
                                                        <Link
                                                            to={child.path}
                                                            className={`flex items-center gap-2 py-2 px-3 rounded-md transition-all duration-200 text-sm ${childActive
                                                                ? 'text-[var(--primary)] font-semibold bg-gray-50'
                                                                : 'text-gray-600 hover:text-[var(--primary)] hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            <span className={`shrink-0 ${childActive ? 'text-[var(--primary)]' : 'text-gray-400'}`}>
                                                                {child.icon}
                                                            </span>
                                                            <span className="truncate">{child.name}</span>
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </li>
                            );
                        }

                        const active = isMatch(item.path);
                        return (
                            <li
                                key={item.path || index}
                                className="relative group"
                                onMouseEnter={(e) => handleItemEnter(e, item.name)}
                                onMouseLeave={handleItemLeave}
                                onFocus={(e) => handleItemEnter(e, item.name)}
                                onBlur={handleItemLeave}
                            >
                                <Link
                                    to={item.path}
                                    title={isCollapsed ? item.name : undefined}
                                    className={`flex items-center gap-3 py-2.5 px-3 rounded-md transition-all duration-200 ${active
                                        ? 'bg-[var(--bg-light)] text-[var(--secondary)] font-semibold border-l-4 border-[var(--primary)] shadow-sm'
                                        : 'text-[var(--text-dark)] hover:bg-gray-100 hover:text-[var(--secondary)] font-medium'
                                        } ${isCollapsed ? 'justify-center border-l-0 border-b-2 border-transparent hover:border-b-2' : 'justify-start'} ${isCollapsed && active ? '!border-b-[var(--primary)] border-l-0 rounded-none' : ''}`}
                                >
                                    <span className={`shrink-0 ${active ? 'text-[var(--secondary)]' : 'text-gray-500 group-hover:text-[var(--secondary)] transition-colors'}`}>
                                        {item.icon}
                                    </span>
                                    {!isCollapsed && (
                                        <span className="truncate text-sm">
                                            {item.name}
                                        </span>
                                    )}
                                </Link>

                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Render Flyout outside the clipped container using fixed position */}
            {isCollapsed && hoveredItemId && flyoutAnchorRect && (() => {
                const hoveredItem = navItems.find(i => i.name === hoveredItemId);
                if (!hoveredItem) return null;
                return (
                    <div
                        className="sidebar-collapsed-flyout fixed bg-white border border-gray-200 shadow-[0_8px_24px_rgba(0,0,0,0.12)] rounded-md z-[9999]"
                        style={{
                            top: flyoutAnchorRect.top,
                            left: flyoutAnchorRect.right + 8,
                            minWidth: '220px',
                            maxWidth: '280px',
                            padding: '8px'
                        }}
                        onMouseEnter={handleFlyoutEnter}
                        onMouseLeave={handleFlyoutLeave}
                        role="menu"
                        aria-expanded="true"
                    >
                        <div className="font-bold text-gray-800 border-b border-gray-100 pb-2 mb-2 px-2 whitespace-nowrap overflow-hidden text-ellipsis">
                            {hoveredItem.name}
                        </div>
                        {hoveredItem.children ? (
                            <ul className="space-y-1">
                                {hoveredItem.children.map(child => {
                                    const active = isMatch(child.path);
                                    return (
                                        <li key={child.path} role="menuitem">
                                            <Link
                                                to={child.path}
                                                onClick={() => setHoveredItemId(null)}
                                                className={`flex items-center gap-2 py-1.5 px-3 rounded-md transition-all text-sm ${active ? 'bg-gray-50 text-[var(--primary)] font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-[var(--primary)]'}`}
                                            >
                                                <span className={`shrink-0 ${active ? 'text-[var(--primary)]' : 'text-gray-400'}`}>{child.icon}</span>
                                                <span className="truncate">{child.name}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="px-2 pb-1" role="menuitem">
                                <Link
                                    to={hoveredItem.path}
                                    onClick={() => setHoveredItemId(null)}
                                    className="text-sm text-[var(--primary)] hover:underline font-medium flex items-center gap-1"
                                >
                                    Open {hoveredItem.name} <ChevronRight size={14} />
                                </Link>
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Footer / Logout */}
            <div className="p-3 border-t border-gray-200 shrink-0">
                <button
                    onClick={handleLogout}
                    title={isCollapsed ? "Logout" : undefined}
                    className={`flex items-center gap-3 w-full py-2.5 px-3 rounded-md text-[var(--text-dark)] hover:text-white hover:bg-red-500 transition-colors group ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                >
                    <span className="shrink-0 text-gray-500 group-hover:text-white transition-colors">
                        <LogOut size={20} />
                    </span>
                    {!isCollapsed && <span className="truncate text-sm font-medium group-hover:text-white">Logout</span>}
                </button>
            </div>
        </div>
    );
}
