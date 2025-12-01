Dans le projet, plusieurs choses ne vont pas.

1. Dans les messages, l'envoie s'effectue. Le destinataire recoit bien le message mais le message ne s'affiche pas.
   L'erreur :
   index-BeJuGtpq.js:89
   GET https://lttmjnjcvrwswqzaconr.supabase.co/rest/v1/messages_2025_10_29_18_05?…-73eb-47e8-a2fa-63fb9169d279%29%29&order=created_at.asc&listing_id=eq.47e8 400 (Bad Request)

index-BeJuGtpq.js:156 Supabase error:
{code: '22P02', details: null, hint: null, message: 'invalid input syntax for type uuid: "1521753b"'}
index-BeJuGtpq.js:156 Error fetching messages:
{code: '22P02', details: null, hint: null, message: 'invalid input syntax for type uuid: "1521753b"'}
index-BeJuGtpq.js:89
PATCH https://lttmjnjcvrwswqzaconr.supabase.co/rest/v1/messages_2025_10_29_18_05?…2fa-63fb9169d279&sender_id=eq.1521753b&is_read=eq.false&listing_id=eq.47e8 400 (Bad Request)
index-BeJuGtpq.js:156 Error marking messages as read:
{code: '22P02', details: null, hint: null, message: 'invalid input syntax for type uuid: "1521753b"'}

Et il est également impossible d'envoyer le message.
L'erreur :

index-BeJuGtpq.js:89
POST https://lttmjnjcvrwswqzaconr.supabase.co/rest/v1/messages_2025_10_29_18_05?…sender%3Aprofiles_2025_10_29_18_05%21sender_id%28full_name%2Cavatar_url%29 400 (Bad Request)

index-BeJuGtpq.js:159 Supabase insert error:
{code: '22P02', details: null, hint: null, message: 'invalid input syntax for type uuid: "47e8"'}
index-BeJuGtpq.js:159 Error sending message:
{code: '22P02', details: null, hint: null, message: 'invalid input syntax for type uuid: "47e8"'}

Les infos de date ne s'affichent ni ne s'envoient.

2. L'administrateur n'a pas accès au dashboard pour regarder les offres des autres utilisateur, et éventuellement les supprimer. Il n'a pas la liste des utilisatuer, leur role et divers données utiles

3. Il n'y a rien qui permet de noter les annonces

4. Il serait intéressant qu'un utilisateur puisse modifier une annonce

5. Il arrive que lors d'un refresh de page que l'on tombe sur une 404 (notament quand je suis sur Profil, déconnexion :

index-BeJuGtpq.js:40 TypeError: Cannot read properties of null (reading 'email')
at zy (index-BeJuGtpq.js:130:2322)
at Ju (index-BeJuGtpq.js:38:17338)
at oc (index-BeJuGtpq.js:40:3159)
at Gd (index-BeJuGtpq.js:40:45236)
at Vd (index-BeJuGtpq.js:40:40082)
at Tm (index-BeJuGtpq.js:40:40010)
at Rl (index-BeJuGtpq.js:40:39863)
at Sc (index-BeJuGtpq.js:40:36176)
at Ud (index-BeJuGtpq.js:40:35124)
at me (index-BeJuGtpq.js:25:1630)
sc @ index-BeJuGtpq.js:40
o.callback @ index-BeJuGtpq.js:40
Bh @ index-BeJuGtpq.js:38
Dd @ index-BeJuGtpq.js:40
zd @ index-BeJuGtpq.js:40
km @ index-BeJuGtpq.js:40
Nm @ index-BeJuGtpq.js:40
qi @ index-BeJuGtpq.js:40
Ud @ index-BeJuGtpq.js:40
me @ index-BeJuGtpq.js:25
$ @ index-BeJuGtpq.js:25Comprendre cette erreur
index-BeJuGtpq.js:130 Uncaught TypeError: Cannot read properties of null (reading 'email')
at zy (index-BeJuGtpq.js:130:2322)
at Ju (index-BeJuGtpq.js:38:17338)
at oc (index-BeJuGtpq.js:40:3159)
at Gd (index-BeJuGtpq.js:40:45236)
at Vd (index-BeJuGtpq.js:40:40082)
at Tm (index-BeJuGtpq.js:40:40010)
at Rl (index-BeJuGtpq.js:40:39863)
at Sc (index-BeJuGtpq.js:40:36176)
at Ud (index-BeJuGtpq.js:40:35124)
at me (index-BeJuGtpq.js:25:1630))

    GET https://fruitura.vercel.app/profile 404

Dis-moi les codes que tu as changé.

J'ai entre temps effectué quelque changements dont voici les codes :

Header.jsx :

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/App";
import { superbase } from "../integrations/superbase/client.js";
import "../styles/Header.css";

const Header = () => {
const { user, signOut } = useAuth();
const navigate = useNavigate();
const [isMenuOpen, setIsMenuOpen] = useState(false);
const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
if (user) {
fetchUnreadCount();
// Écouter les nouveaux messages en temps réel
const subscription = superbase
.channel("messages-changes")
.on(
"postgres_changes",
{
event: "\*",
schema: "public",
table: "messages_2025_10_29_18_05",
filter: `receiver_id=eq.${user.id}`,
},
() => {
fetchUnreadCount();
}
)
.subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }

}, [user]);

const fetchUnreadCount = async () => {
if (!user) return;

    try {
      const { data, error } = await superbase
        .from("messages_2025_10_29_18_05")
        .select("id")
        .eq("receiver_id", user.id)
        .eq("is_read", false);

      if (error) throw error;
      setUnreadCount(data?.length || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }

};

const handleSignOut = async () => {
await signOut();
navigate("/");
setIsMenuOpen(false);
};

const toggleMenu = () => {
setIsMenuOpen(!isMenuOpen);
};

const closeMenu = () => {
setIsMenuOpen(false);
};

return (

<header className="header">
<div className="container">
<div className="header-content">
<Link to="/" className="logo" onClick={closeMenu}>
<span className="logo-icon">🍎</span>
<span className="logo-text">Fruitura</span>
</Link>

          <nav className={`nav ${isMenuOpen ? "nav-open" : ""}`}>
            <Link to="/" className="nav-link" onClick={closeMenu}>
              Accueil
            </Link>
            {user ? (
              <>
                <Link
                  to="/create-listing"
                  className="nav-link"
                  onClick={closeMenu}
                >
                  Publier une annonce
                </Link>
                <Link
                  to="/messages"
                  className="nav-link nav-link-with-badge"
                  onClick={closeMenu}
                >
                  Messages
                  {unreadCount > 0 && (
                    <span className="unread-badge-header">{unreadCount}</span>
                  )}
                </Link>
                <Link to="/favorites" className="nav-link" onClick={closeMenu}>
                  Favoris
                </Link>
                <Link to="/profile" className="nav-link" onClick={closeMenu}>
                  Profil
                </Link>
                <button
                  onClick={handleSignOut}
                  className="btn btn-outline btn-sm"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn-outline btn-sm"
                  onClick={closeMenu}
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary btn-sm"
                  onClick={closeMenu}
                >
                  Inscription
                </Link>
              </>
            )}
          </nav>

          <div
            className={`mobile-menu-toggle ${isMenuOpen ? "active" : ""}`}
            onClick={toggleMenu}
          >
            <span></span>
            <span></span>
            <span></span>
            {unreadCount > 0 && (
              <span className="mobile-badge-indicator"></span>
            )}
          </div>
        </div>
      </div>

      {/* Overlay pour fermer le menu en cliquant à côté */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMenu}></div>
      )}
    </header>

);
};

export default Header;

Header.css :

.header {
background-color: var(--white);
box-shadow: var(--shadow);
position: sticky;
top: 0;
z-index: 1000;
}

.header-content {
display: flex;
align-items: center;
justify-content: space-between;
padding: 1rem 0;
position: relative;
}

.logo {
display: flex;
align-items: center;
text-decoration: none;
color: var(--primary-color);
font-weight: bold;
font-size: 1.5rem;
z-index: 1001;
}

.logo-icon {
font-size: 2rem;
margin-right: 0.5rem;
}

.logo-text {
color: var(--primary-color);
}

.logo:hover {
color: var(--primary-dark);
}

.nav {
display: flex;
align-items: center;
gap: 1.5rem;
}

.nav-link {
text-decoration: none;
color: var(--text-color);
font-weight: 500;
padding: 0.5rem 0;
position: relative;
transition: var(--transition);
display: flex;
align-items: center;
gap: 0.5rem;
}

.nav-link:hover {
color: var(--primary-color);
}

.nav-link::after {
content: "";
position: absolute;
bottom: 0;
left: 0;
width: 0;
height: 2px;
background-color: var(--primary-color);
transition: width 0.3s ease;
}

.nav-link:hover::after {
width: 100%;
}

.btn-sm {
padding: 0.5rem 1rem;
font-size: 0.9rem;
}

/_ Badge pour les messages non lus _/
.unread-badge-header {
background: #ff4444;
color: white;
border-radius: 50%;
width: 20px;
height: 20px;
display: flex;
align-items: center;
justify-content: center;
font-size: 0.7rem;
font-weight: 600;
animation: pulse 2s infinite;
}

.mobile-menu-toggle {
display: none;
flex-direction: column;
cursor: pointer;
padding: 0.5rem;
z-index: 1001;
transition: var(--transition);
position: relative;
}

.mobile-menu-toggle span {
width: 25px;
height: 3px;
background-color: var(--primary-color);
margin: 2px 0;
transition: var(--transition);
transform-origin: center;
}

.mobile-menu-toggle:hover span {
background-color: var(--primary-dark);
}

/_ Indicateur de messages sur mobile _/
.mobile-badge-indicator {
position: absolute;
top: 2px;
right: 2px;
width: 8px;
height: 8px;
background: #ff4444;
border-radius: 50%;
border: 2px solid var(--white);
animation: pulse 2s infinite;
}

/_ Animation du menu burger _/
.mobile-menu-toggle.active span:nth-child(1) {
transform: rotate(45deg) translate(6px, 6px);
}

.mobile-menu-toggle.active span:nth-child(2) {
opacity: 0;
}

.mobile-menu-toggle.active span:nth-child(3) {
transform: rotate(-45deg) translate(6px, -6px);
}

.mobile-menu-overlay {
display: none;
position: fixed;
top: 0;
left: 0;
right: 0;
bottom: 0;
background-color: rgba(0, 0, 0, 0.5);
z-index: 998;
}

@keyframes pulse {
0% {
transform: scale(1);
opacity: 1;
}
50% {
transform: scale(1.1);
opacity: 0.8;
}
100% {
transform: scale(1);
opacity: 1;
}
}

@media (max-width: 768px) {
.nav {
position: fixed;
top: 0;
right: -100%;
width: 80%;
max-width: 300px;
height: 100vh;
background-color: var(--white);
flex-direction: column;
align-items: flex-start;
padding: 5rem 2rem 2rem;
gap: 1.5rem;
box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
transition: right 0.3s ease;
z-index: 1000;
}

.nav-open {
right: 0;
}

.nav-link {
padding: 0.75rem 0;
font-size: 1.1rem;
width: 100%;
border-bottom: 1px solid var(--border-color);
}

.nav-link::after {
display: none;
}

.mobile-menu-toggle {
display: flex;
}

.mobile-menu-overlay {
display: block;
}

.header-content {
padding: 0.75rem 0;
}
}

@media (max-width: 480px) {
.nav {
width: 100%;
max-width: none;
}

.logo-text {
font-size: 1.3rem;
}

.logo-icon {
font-size: 1.7rem;
}
}

Message page.css :

.messages-page {
min-height: 100vh;
display: flex;
flex-direction: column;
background: linear-gradient(135deg, #f8fdf8 0%, #f0f7f0 100%);
}

.messages-page .main-content {
flex: 1;
padding: 1rem 0 2rem;
}

.messages-header-section {
text-align: center;
margin-bottom: 2rem;
padding: 0 1rem;
}

.messages-header-section h1 {
color: var(--primary-color);
margin-bottom: 0.5rem;
font-size: 2.5rem;
font-weight: 700;
}

.messages-header-section p {
color: var(--text-light);
font-size: 1.1rem;
max-width: 500px;
margin: 0 auto;
}

.messages-container {
display: grid;
grid-template-columns: 380px 1fr;
height: 75vh;
max-height: 800px;
background: var(--white);
border-radius: 20px;
box-shadow: 0 10px 40px rgba(45, 90, 39, 0.1);
overflow: hidden;
border: 1px solid var(--border-color);
}

.conversations-sidebar {
border-right: 1px solid var(--border-color);
display: flex;
flex-direction: column;
background: var(--white);
}

.conversations-sidebar .sidebar-header {
padding: 1.5rem;
border-bottom: 1px solid var(--border-color);
background: linear-gradient(
135deg,
var(--primary-color),
var(--primary-dark)
);
color: white;
}

.sidebar-header-top {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 1rem;
}

.sidebar-header-top h2 {
margin: 0;
font-size: 1.4rem;
font-weight: 600;
}

.close-sidebar {
display: none;
background: none;
border: none;
font-size: 1.8rem;
color: white;
cursor: pointer;
padding: 0.25rem 0.5rem;
border-radius: 4px;
transition: background 0.3s ease;
line-height: 1;
}

.close-sidebar:hover {
background: rgba(255, 255, 255, 0.2);
}

.search-container {
position: relative;
display: flex;
align-items: center;
}

.search-input {
width: 100%;
padding: 0.75rem 1rem 0.75rem 2.5rem;
border: none;
border-radius: 12px;
background: rgba(255, 255, 255, 0.9);
font-size: 0.9rem;
transition: all 0.3s ease;
}

.search-input:focus {
outline: none;
background: white;
box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
}

.search-input::placeholder {
color: var(--text-light);
}

.search-icon {
position: absolute;
left: 1rem;
color: var(--text-light);
font-size: 0.9rem;
}

.conversations-sidebar .conversations-list {
flex: 1;
overflow-y: auto;
background: var(--white);
}

.conversations-sidebar .conversations-list .conversation-item {
display: flex;
align-items: center;
padding: 1.25rem 1.5rem;
cursor: pointer;
transition: all 0.3s ease;
border-bottom: 1px solid var(--border-color);
position: relative;
}

.conversations-sidebar .conversations-list .conversation-item:hover {
background: var(--background-color);
transform: translateX(5px);
}

.conversations-sidebar .conversations-list .conversation-item.active {
background: linear-gradient(
135deg,
rgba(45, 90, 39, 0.08),
rgba(45, 90, 39, 0.12)
);
border-right: 4px solid var(--primary-color);
}

.conversations-sidebar .conversations-list .conversation-item.unread {
background: rgba(255, 68, 68, 0.03);
}

.conversations-sidebar
.conversations-list
.conversation-item
.conversation-avatar {
width: 55px;
height: 55px;
border-radius: 50%;
overflow: hidden;
margin-right: 1rem;
background: linear-gradient(
135deg,
var(--primary-color),
var(--primary-dark)
);
display: flex;
align-items: center;
justify-content: center;
flex-shrink: 0;
position: relative;
border: 3px solid var(--white);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.conversations-sidebar
.conversations-list
.conversation-item
.conversation-avatar
img {
width: 100%;
height: 100%;
object-fit: cover;
}

.conversations-sidebar
.conversations-list
.conversation-item
.conversation-avatar
span {
color: var(--white);
font-size: 1.4rem;
}

.online-indicator {
position: absolute;
bottom: 2px;
right: 2px;
width: 12px;
height: 12px;
background: #00c853;
border: 2px solid var(--white);
border-radius: 50%;
}

.conversations-sidebar
.conversations-list
.conversation-item
.conversation-info {
flex: 1;
min-width: 0;
}

.conversations-sidebar
.conversations-list
.conversation-item
.conversation-info
.conversation-header {
display: flex;
justify-content: space-between;
align-items: flex-start;
margin-bottom: 0.5rem;
}

.conversations-sidebar
.conversations-list
.conversation-item
.conversation-info
.conversation-header
h4 {
margin: 0;
font-size: 1.05rem;
font-weight: 600;
color: var(--text-color);
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
}

.conversations-sidebar
.conversations-list
.conversation-item
.conversation-info
.conversation-header
.conversation-time {
font-size: 0.75rem;
color: var(--text-light);
flex-shrink: 0;
margin-left: 0.5rem;
font-weight: 500;
}

.conversations-sidebar
.conversations-list
.conversation-item
.conversation-info
.conversation-listing {
font-size: 0.8rem;
color: var(--primary-color);
margin-bottom: 0.5rem;
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
font-weight: 500;
background: rgba(45, 90, 39, 0.1);
padding: 0.2rem 0.5rem;
border-radius: 8px;
display: inline-block;
}

.conversations-sidebar
.conversations-list
.conversation-item
.conversation-info
.conversation-preview {
display: flex;
justify-content: space-between;
align-items: center;
}

.conversations-sidebar
.conversations-list
.conversation-item
.conversation-info
.conversation-preview
.last-message {
font-size: 0.9rem;
color: var(--text-light);
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
flex: 1;
line-height: 1.4;
}

.conversations-sidebar
.conversations-list
.conversation-item
.conversation-info
.conversation-preview
.last-message.unread {
color: var(--text-color);
font-weight: 600;
}

.conversations-sidebar
.conversations-list
.conversation-item
.conversation-info
.conversation-preview
.unread-badge {
background: linear-gradient(135deg, #ff4444, #cc0000);
color: var(--white);
border-radius: 12px;
min-width: 22px;
height: 22px;
display: flex;
align-items: center;
justify-content: center;
font-size: 0.7rem;
font-weight: 700;
margin-left: 0.5rem;
flex-shrink: 0;
box-shadow: 0 2px 8px rgba(255, 68, 68, 0.3);
}

.conversations-sidebar .conversations-list .no-conversations {
padding: 3rem 1.5rem;
text-align: center;
color: var(--text-light);
height: 100%;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
}

.conversations-sidebar
.conversations-list
.no-conversations
.no-conversations-icon {
font-size: 4rem;
display: block;
margin-bottom: 1.5rem;
opacity: 0.3;
}

.conversations-sidebar .conversations-list .no-conversations p {
margin-bottom: 0.75rem;
font-weight: 600;
font-size: 1.1rem;
}

.conversations-sidebar .conversations-list .no-conversations small {
line-height: 1.5;
max-width: 250px;
}

.messages-main {
display: flex;
flex-direction: column;
background: var(--white);
}

.messages-main .messages-header {
padding: 1.25rem 1.5rem;
border-bottom: 1px solid var(--border-color);
background: var(--white);
box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.messages-main .messages-header .chat-user-info {
display: flex;
align-items: center;
}

.messages-main .messages-header .chat-user-info .back-button {
display: none;
background: none;
border: none;
font-size: 1.5rem;
cursor: pointer;
margin-right: 1rem;
color: var(--primary-color);
padding: 0.5rem;
border-radius: 8px;
transition: background 0.3s ease;
min-width: 40px;
height: 40px;
display: flex;
align-items: center;
justify-content: center;
}

.messages-main .messages-header .chat-user-info .back-button:hover {
background: var(--background-color);
}

.messages-main .messages-header .chat-user-info .chat-avatar {
width: 55px;
height: 55px;
border-radius: 50%;
overflow: hidden;
margin-right: 1rem;
background: linear-gradient(
135deg,
var(--primary-color),
var(--primary-dark)
);
display: flex;
align-items: center;
justify-content: center;
border: 3px solid var(--white);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.messages-main .messages-header .chat-user-info .chat-avatar img {
width: 100%;
height: 100%;
object-fit: cover;
}

.messages-main .messages-header .chat-user-info .chat-avatar span {
color: var(--white);
font-size: 1.4rem;
}

.messages-main .messages-header .chat-user-info .chat-details h3 {
margin: 0 0 0.25rem 0;
color: var(--text-color);
font-size: 1.2rem;
font-weight: 600;
}

.messages-main .messages-header .chat-user-info .chat-details p {
margin: 0;
color: var(--text-light);
font-size: 0.9rem;
}

.messages-main .messages-content {
flex: 1;
padding: 1.5rem;
overflow-y: auto;
background: linear-gradient(180deg, #f8fdf8 0%, #ffffff 100%);
display: flex;
flex-direction: column;
gap: 1rem;
}

.messages-main .messages-content .message {
display: flex;
max-width: 70%;
animation: fadeInUp 0.3s ease;
}

.messages-main .messages-content .message.sent {
align-self: flex-end;
margin-left: auto;
}

.messages-main .messages-content .message.received {
align-self: flex-start;
}

.messages-main .messages-content .message .message-bubble {
padding: 1rem 1.25rem;
border-radius: 20px;
position: relative;
box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
line-height: 1.5;
word-wrap: break-word;
}

.messages-main .messages-content .message.sent .message-bubble {
background: linear-gradient(
135deg,
var(--primary-color),
var(--primary-dark)
);
color: var(--white);
border-bottom-right-radius: 6px;
}

.messages-main .messages-content .message.received .message-bubble {
background: var(--white);
color: var(--text-color);
border: 1px solid var(--border-color);
border-bottom-left-radius: 6px;
}

.messages-main .messages-content .message .message-bubble p {
margin: 0 0 0.5rem 0;
font-size: 0.95rem;
}

.messages-main .messages-content .message .message-bubble .message-time {
font-size: 0.75rem;
opacity: 0.8;
display: block;
text-align: right;
margin-top: 0.25rem;
}

.messages-main
.messages-content
.message.received
.message-bubble
.message-time {
text-align: left;
color: var(--text-light);
}

.messages-main .messages-content .no-messages {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
height: 100%;
color: var(--text-light);
text-align: center;
padding: 2rem;
}

.messages-main .messages-content .no-messages .no-messages-icon {
font-size: 4rem;
margin-bottom: 1.5rem;
opacity: 0.3;
}

.messages-main .messages-content .no-messages p {
margin-bottom: 0.5rem;
font-weight: 600;
font-size: 1.1rem;
}

.messages-main .messages-content .no-messages small {
line-height: 1.5;
max-width: 300px;
}

.messages-main .message-form {
padding: 1.5rem;
border-top: 1px solid var(--border-color);
background: var(--white);
}

.messages-main .message-form .message-input-container {
display: flex;
gap: 0.75rem;
align-items: center;
}

.messages-main .message-form .message-input-container input {
flex: 1;
padding: 1rem 1.25rem;
border: 2px solid var(--border-color);
border-radius: 25px;
font-size: 0.95rem;
transition: all 0.3s ease;
background: var(--white);
}

.messages-main .message-form .message-input-container input:focus {
outline: none;
border-color: var(--primary-color);
box-shadow: 0 0 0 3px rgba(45, 90, 39, 0.1);
}

.messages-main .message-form .message-input-container input:disabled {
background: var(--background-color);
cursor: not-allowed;
}

.messages-main .message-form .message-input-container .send-button {
background: linear-gradient(
135deg,
var(--primary-color),
var(--primary-dark)
);
color: var(--white);
border: none;
border-radius: 50%;
width: 50px;
height: 50px;
cursor: pointer;
transition: all 0.3s ease;
display: flex;
align-items: center;
justify-content: center;
font-size: 1.2rem;
box-shadow: 0 4px 15px rgba(45, 90, 39, 0.3);
}

.messages-main
.message-form
.message-input-container
.send-button:hover:not(:disabled) {
transform: translateY(-2px);
box-shadow: 0 6px 20px rgba(45, 90, 39, 0.4);
}

.messages-main .message-form .message-input-container .send-button:disabled {
opacity: 0.6;
cursor: not-allowed;
transform: none;
}

.messages-main
.message-form
.message-input-container
.send-button
.send-spinner {
width: 20px;
height: 20px;
border: 2px solid transparent;
border-top: 2px solid currentColor;
border-radius: 50%;
animation: spin 1s linear infinite;
}

.messages-main .no-conversation-selected {
display: flex;
align-items: center;
justify-content: center;
height: 100%;
background: linear-gradient(135deg, #f8fdf8 0%, #f0f7f0 100%);
}

.messages-main .no-conversation-selected .no-conversation-content {
text-align: center;
color: var(--text-light);
max-width: 400px;
padding: 2rem;
}

.messages-main
.no-conversation-selected
.no-conversation-content
.no-conversation-icon {
font-size: 5rem;
display: block;
margin-bottom: 1.5rem;
opacity: 0.3;
}

.messages-main .no-conversation-selected .no-conversation-content h3 {
margin-bottom: 1rem;
color: var(--text-color);
font-size: 1.5rem;
}

.messages-main .no-conversation-selected .no-conversation-content p {
line-height: 1.6;
font-size: 1rem;
margin-bottom: 1.5rem;
}

.btn {
padding: 0.75rem 1.5rem;
border: none;
border-radius: 8px;
font-weight: 600;
cursor: pointer;
transition: all 0.3s ease;
text-decoration: none;
display: inline-block;
text-align: center;
font-size: 0.95rem;
}

.btn-primary {
background: linear-gradient(
135deg,
var(--primary-color),
var(--primary-dark)
);
color: white;
}

.btn-primary:hover {
transform: translateY(-2px);
box-shadow: 0 4px 15px rgba(45, 90, 39, 0.3);
}

.loading-container {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
height: 50vh;
color: var(--text-light);
}

.loading-spinner {
width: 40px;
height: 40px;
border: 4px solid var(--border-color);
border-left: 4px solid var(--primary-color);
border-radius: 50%;
animation: spin 1s linear infinite;
margin-bottom: 1rem;
}

@keyframes spin {
0% {
transform: rotate(0deg);
}
100% {
transform: rotate(360deg);
}
}

@keyframes fadeInUp {
from {
opacity: 0;
transform: translateY(10px);
}
to {
opacity: 1;
transform: translateY(0);
}
}

/_ ===== RESPONSIVE DESIGN ===== _/

@media (max-width: 1024px) {
.messages-container {
grid-template-columns: 320px 1fr;
height: 70vh;
}

.conversations-sidebar .conversations-list .conversation-item {
padding: 1rem 1.25rem;
}
}

@media (max-width: 768px) {
.messages-header-section {
margin-bottom: 1.5rem;
padding: 0 0.75rem;
}

.messages-header-section h1 {
font-size: 2rem;
}

.messages-header-section p {
font-size: 1rem;
}

.messages-container {
grid-template-columns: 1fr;
height: calc(100vh - 140px);
border-radius: 15px;
position: relative;
}

/_ Sidebar mobile _/
.conversations-sidebar {
position: fixed;
top: 0;
left: -100%;
width: 100%;
height: 100%;
z-index: 1000;
transition: left 0.3s ease;
border-radius: 0;
border-right: none;
}

.conversations-sidebar.active {
left: 0;
}

.close-sidebar {
display: block;
}

.sidebar-header {
padding: 1rem 1.25rem !important;
}

.sidebar-header-top h2 {
font-size: 1.3rem;
}

/_ Header des messages mobile _/
.messages-main .messages-header {
padding: 1rem 1.25rem;
}

.messages-main .messages-header .chat-user-info .back-button {
display: flex !important;
}

.messages-main .messages-header .chat-user-info .chat-avatar {
width: 45px;
height: 45px;
margin-right: 0.875rem;
}

.messages-main .messages-header .chat-user-info .chat-details h3 {
font-size: 1.1rem;
}

/_ Contenu des messages mobile _/
.messages-main .messages-content {
padding: 1.25rem;
min-height: 50vh;
}

.messages-main .messages-content .message {
max-width: 85%;
}

.messages-main .messages-content .message .message-bubble {
padding: 0.875rem 1rem;
}

.messages-main .messages-content .message .message-bubble p {
font-size: 0.9rem;
}

/_ Formulaire d'envoi mobile _/
.messages-main .message-form {
padding: 1.25rem;
}

.messages-main .message-form .message-input-container input {
padding: 0.875rem 1.125rem;
font-size: 0.9rem;
}

.messages-main .message-form .message-input-container .send-button {
width: 45px;
height: 45px;
font-size: 1.1rem;
}

/_ État "aucune conversation sélectionnée" mobile _/
.messages-main .no-conversation-selected .no-conversation-content {
padding: 1.5rem;
}

.messages-main
.no-conversation-selected
.no-conversation-content
.no-conversation-icon {
font-size: 4rem;
}

.messages-main .no-conversation-selected .no-conversation-content h3 {
font-size: 1.3rem;
}

.messages-main .no-conversation-selected .no-conversation-content p {
font-size: 0.95rem;
}

/_ Liste des conversations mobile _/
.conversations-sidebar .conversations-list .conversation-item {
padding: 1rem 1.25rem;
}

.conversations-sidebar
.conversations-list
.conversation-item
.conversation-avatar {
width: 50px;
height: 50px;
margin-right: 0.875rem;
}

.conversations-sidebar
.conversations-list
.conversation-item
.conversation-info
.conversation-header
h4 {
font-size: 1rem;
}

.conversations-sidebar .conversations-list .no-conversations {
padding: 2rem 1.25rem;
}
}

@media (max-width: 480px) {
.messages-page .main-content {
padding: 0.5rem 0 1.5rem;
}

.messages-header-section {
margin-bottom: 1rem;
}

.messages-header-section h1 {
font-size: 1.75rem;
}

.messages-container {
height: calc(100vh - 120px);
border-radius: 12px;
}

.messages-main .messages-header {
padding: 0.875rem 1rem;
}

.messages-main .messages-header .chat-user-info .back-button {
min-width: 36px;
height: 36px;
font-size: 1.3rem;
margin-right: 0.75rem;
}

.messages-main .messages-header .chat-user-info .chat-avatar {
width: 42px;
height: 42px;
margin-right: 0.75rem;
}

.messages-main .messages-header .chat-user-info .chat-details h3 {
font-size: 1rem;
}

.messages-main .messages-header .chat-user-info .chat-details p {
font-size: 0.85rem;
}

.messages-main .messages-content {
padding: 1rem;
}

.messages-main .messages-content .message {
max-width: 90%;
}

.messages-main .messages-content .message .message-bubble {
padding: 0.75rem 0.875rem;
}

.messages-main .message-form {
padding: 1rem;
}

.messages-main .message-form .message-input-container input {
padding: 0.75rem 1rem;
}

.messages-main .message-form .message-input-container .send-button {
width: 42px;
height: 42px;
font-size: 1rem;
}

.sidebar-header {
padding: 0.875rem 1rem !important;
}

.search-input {
padding: 0.625rem 0.875rem 0.625rem 2.25rem;
font-size: 0.85rem;
}

.search-icon {
left: 0.875rem;
}

.conversations-sidebar .conversations-list .conversation-item {
padding: 0.875rem 1rem;
}

.conversations-sidebar
.conversations-list
.conversation-item
.conversation-avatar {
width: 45px;
height: 45px;
margin-right: 0.75rem;
}

.conversations-sidebar
.conversations-list
.conversation-item
.conversation-info
.conversation-header
h4 {
font-size: 0.95rem;
}

.conversations-sidebar
.conversations-list
.conversation-item
.conversation-info
.conversation-preview
.last-message {
font-size: 0.85rem;
}
}

@media (max-width: 360px) {
.messages-main .messages-content .message {
max-width: 95%;
}

.messages-main .messages-content .message .message-bubble {
padding: 0.625rem 0.75rem;
}

.messages-main .messages-content .message .message-bubble p {
font-size: 0.85rem;
}

.conversations-sidebar .conversations-list .conversation-item {
padding: 0.75rem 0.875rem;
}

.conversations-sidebar
.conversations-list
.conversation-item
.conversation-avatar {
width: 40px;
height: 40px;
margin-right: 0.625rem;
}
}

/_ Amélioration du scroll sur mobile _/
@media (max-width: 768px) {
.conversations-sidebar .conversations-list,
.messages-main .messages-content {
-webkit-overflow-scrolling: touch;
scroll-behavior: smooth;
}
}

/_ Correction pour les très petits écrans _/
@media (max-height: 600px) {
.messages-container {
height: calc(100vh - 100px);
}

.conversations-sidebar .conversations-list .conversation-item {
padding: 0.75rem 1rem;
}

.messages-main .messages-content {
padding: 1rem;
}
}

MessagePage.jsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { superbase } from "../integrations/superbase/client.js";
import { useAuth } from "../components/App.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/MessagesPage.css";

const MessagesPage = () => {
const { user } = useAuth();
const navigate = useNavigate();
const [conversations, setConversations] = useState([]);
const [selectedConversation, setSelectedConversation] = useState(null);
const [messages, setMessages] = useState([]);
const [newMessage, setNewMessage] = useState("");
const [loading, setLoading] = useState(true);
const [sendingMessage, setSendingMessage] = useState(false);
const [searchTerm, setSearchTerm] = useState("");
const [showConversations, setShowConversations] = useState(false);
const messagesEndRef = useRef(null);

useEffect(() => {
if (!user) {
navigate("/login");
return;
}
fetchConversations();
}, [user, navigate]);

useEffect(() => {
if (selectedConversation) {
fetchMessages(selectedConversation.id);
markMessagesAsRead(selectedConversation.id);
}
}, [selectedConversation]);

useEffect(() => {
scrollToBottom();
}, [messages]);

const scrollToBottom = () => {
messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
};

const fetchConversations = async () => {
try {
setLoading(true);

      const { data: messagesData, error } = await superbase
        .from("messages_2025_10_29_18_05")
        .select(
          `
          *,
          sender:profiles_2025_10_29_18_05!sender_id(full_name, avatar_url),
          receiver:profiles_2025_10_29_18_05!receiver_id(full_name, avatar_url),
          listings_2025_10_29_18_05(title, fruit_type)
        `
        )
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const conversationsMap = new Map();

      messagesData?.forEach((message) => {
        const otherUserId =
          message.sender_id === user.id
            ? message.receiver_id
            : message.sender_id;

        // CORRECTION : Créer une clé de conversation simple et fiable
        const conversationKey = `${user.id}-${otherUserId}-${
          message.listing_id || "general"
        }`;

        if (!conversationsMap.has(conversationKey)) {
          conversationsMap.set(conversationKey, {
            id: conversationKey,
            otherUser:
              message.sender_id === user.id ? message.receiver : message.sender,
            otherUserId: otherUserId,
            listing: message.listings_2025_10_29_18_05,
            lastMessage: message,
            unreadCount: 0,
          });
        }

        const conversation = conversationsMap.get(conversationKey);
        if (
          new Date(message.created_at) >
          new Date(conversation.lastMessage.created_at)
        ) {
          conversation.lastMessage = message;
        }

        if (!message.is_read && message.receiver_id === user.id) {
          conversation.unreadCount++;
        }
      });

      setConversations(Array.from(conversationsMap.values()));
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }

};

const fetchMessages = async (conversationId) => {
try {
// console.log("Fetching messages for conversation:", conversationId);

      const parts = conversationId.split("-");
      // CORRECTION : Prendre les 3 premières parties seulement (userID-otherUserID-listingID)
      const userId1 = parts[0];
      const userId2 = parts[1];
      const listingId = parts[2];

      // CORRECTION : Identifier correctement l'autre utilisateur
      const otherUserId = userId1 === user.id ? userId2 : userId1;

      // console.log("User ID:", user.id);
      // console.log("Other User ID:", otherUserId);
      // console.log("Listing ID:", listingId);

      let query = superbase
        .from("messages_2025_10_29_18_05")
        .select(
          `
          *,
          sender:profiles_2025_10_29_18_05!sender_id(full_name, avatar_url)
        `
        )
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      if (listingId !== "general") {
        query = query.eq("listing_id", listingId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      // console.log("Fetched messages:", data);
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }

};

const markMessagesAsRead = async (conversationId) => {
try {
const parts = conversationId.split("-");
const userId1 = parts[0];
const userId2 = parts[1];
const listingId = parts[2];

      const otherUserId = userId1 === user.id ? userId2 : userId1;

      let query = superbase
        .from("messages_2025_10_29_18_05")
        .update({ is_read: true })
        .eq("receiver_id", user.id)
        .eq("sender_id", otherUserId)
        .eq("is_read", false);

      if (listingId !== "general") {
        query = query.eq("listing_id", listingId);
      }

      const { error } = await query;
      if (error) throw error;

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }

};

const sendMessage = async (e) => {
e.preventDefault();
if (!newMessage.trim() || !selectedConversation) return;

    setSendingMessage(true);
    try {
      const parts = selectedConversation.id.split("-");
      const userId1 = parts[0];
      const userId2 = parts[1];
      const listingId = parts[2];

      const receiverId = userId1 === user.id ? userId2 : userId1;

      const messageData = {
        sender_id: user.id,
        receiver_id: receiverId,
        content: newMessage.trim(),
        listing_id: listingId !== "general" ? listingId : null,
        is_read: false,
      };

      // console.log("Sending message with data:", messageData);

      const { data, error } = await superbase
        .from("messages_2025_10_29_18_05")
        .insert(messageData)
        .select(
          `
          *,
          sender:profiles_2025_10_29_18_05!sender_id(full_name, avatar_url)
        `
        )
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      setMessages((prev) => [...prev, data]);
      setNewMessage("");

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id
            ? {
                ...conv,
                lastMessage: data,
                unreadCount: 0,
              }
            : conv
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Erreur lors de l'envoi du message");
    } finally {
      setSendingMessage(false);
    }

};

const formatMessageTime = (dateString) => {
const date = new Date(dateString);
const now = new Date();
const diffInHours = (now - date) / (1000 _ 60 _ 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString("fr-FR", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

};

const filteredConversations = conversations.filter(
(conv) =>
conv.otherUser?.full_name
?.toLowerCase()
.includes(searchTerm.toLowerCase()) ||
conv.listing?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
conv.lastMessage?.content
?.toLowerCase()
.includes(searchTerm.toLowerCase())
);

const toggleConversations = () => {
setShowConversations(!showConversations);
};

const handleSelectConversation = (conversation) => {
setSelectedConversation(conversation);
setShowConversations(false);
};

if (loading) {
return (

<div className="loading-container">
<div className="loading-spinner"></div>
<p>Chargement des messages...</p>
</div>
);
}

return (

<div className="messages-page">
<Header />

      <main className="main-content">
        <div className="container">
          <div className="messages-header-section">
            <h1>Mes messages</h1>
            <p>Gérez vos conversations avec les autres utilisateurs</p>
          </div>

          <div className="messages-container">
            {/* Sidebar des conversations */}
            <div
              className={`conversations-sidebar ${
                showConversations ? "active" : ""
              }`}
            >
              <div className="sidebar-header">
                <div className="sidebar-header-top">
                  <h2>Conversations</h2>
                  <button
                    className="close-sidebar"
                    onClick={() => setShowConversations(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <span className="search-icon">🔍</span>
                </div>
              </div>

              <div className="conversations-list">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`conversation-item ${
                        selectedConversation?.id === conversation.id
                          ? "active"
                          : ""
                      } ${conversation.unreadCount > 0 ? "unread" : ""}`}
                      onClick={() => handleSelectConversation(conversation)}
                    >
                      <div className="conversation-avatar">
                        {conversation.otherUser?.avatar_url ? (
                          <img
                            src={conversation.otherUser.avatar_url}
                            alt="Avatar"
                          />
                        ) : (
                          <span>👤</span>
                        )}
                        {conversation.unreadCount > 0 && (
                          <span className="online-indicator"></span>
                        )}
                      </div>

                      <div className="conversation-info">
                        <div className="conversation-header">
                          <h4>
                            {conversation.otherUser?.full_name || "Utilisateur"}
                          </h4>
                          <span className="conversation-time">
                            {formatMessageTime(
                              conversation.lastMessage.created_at
                            )}
                          </span>
                        </div>

                        {conversation.listing && (
                          <div className="conversation-listing">
                            🍓 {conversation.listing.title}
                          </div>
                        )}

                        <div className="conversation-preview">
                          <span
                            className={`last-message ${
                              conversation.unreadCount > 0 ? "unread" : ""
                            }`}
                          >
                            {conversation.lastMessage.sender_id === user.id
                              ? "Vous: "
                              : ""}
                            {conversation.lastMessage.content.length > 35
                              ? `${conversation.lastMessage.content.substring(
                                  0,
                                  35
                                )}...`
                              : conversation.lastMessage.content}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <span className="unread-badge">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-conversations">
                    <span className="no-conversations-icon">💬</span>
                    <p>Aucune conversation</p>
                    <small>
                      {searchTerm
                        ? "Aucun résultat pour votre recherche"
                        : "Contactez un propriétaire depuis une annonce pour commencer une conversation"}
                    </small>
                  </div>
                )}
              </div>
            </div>

            {/* Zone principale des messages */}
            <div className="messages-main">
              {selectedConversation ? (
                <>
                  <div className="messages-header">
                    <div className="chat-user-info">
                      <button
                        className="back-button"
                        onClick={toggleConversations}
                      >
                        ☰
                      </button>
                      <div className="chat-avatar">
                        {selectedConversation.otherUser?.avatar_url ? (
                          <img
                            src={selectedConversation.otherUser.avatar_url}
                            alt="Avatar"
                          />
                        ) : (
                          <span>👤</span>
                        )}
                      </div>
                      <div className="chat-details">
                        <h3>
                          {selectedConversation.otherUser?.full_name ||
                            "Utilisateur"}
                        </h3>
                        {selectedConversation.listing && (
                          <p>
                            À propos de: {selectedConversation.listing.title}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="messages-content">
                    {messages.length > 0 ? (
                      <>
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`message ${
                              message.sender_id === user.id
                                ? "sent"
                                : "received"
                            }`}
                          >
                            <div className="message-bubble">
                              <p>{message.content}</p>
                              <span className="message-time">
                                {formatMessageTime(message.created_at)}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </>
                    ) : (
                      <div className="no-messages">
                        <span className="no-messages-icon">💭</span>
                        <p>Aucun message échangé</p>
                        <small>Soyez le premier à envoyer un message !</small>
                      </div>
                    )}
                  </div>

                  <form onSubmit={sendMessage} className="message-form">
                    <div className="message-input-container">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Tapez votre message..."
                        disabled={sendingMessage}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sendingMessage}
                        className="send-button"
                      >
                        {sendingMessage ? (
                          <div className="send-spinner"></div>
                        ) : (
                          "📤"
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="no-conversation-selected">
                  <div className="no-conversation-content">
                    <span className="no-conversation-icon">💬</span>
                    <h3>Sélectionnez une conversation</h3>
                    <p>
                      Choisissez une conversation dans la liste pour commencer à
                      échanger
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={toggleConversations}
                    >
                      Voir les conversations
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>

);
};

export default MessagesPage;

HomePage.css :

.home-page {
min-height: 100vh;
display: flex;
flex-direction: column;

.main-content {
flex: 1;
}

.hero-section {
background: linear-gradient(
135deg,
var(--primary-color),
var(--primary-light)
);
color: var(--white);
padding: 4rem 0;
text-align: center;

    .hero-content {
      h1 {
        font-size: 3rem;
        font-weight: 700;
        margin-bottom: 1rem;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      }

      p {
        font-size: 1.3rem;
        margin-bottom: 2rem;
        opacity: 0.9;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
      }

      .hero-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;

        .btn-lg {
          padding: 1rem 2rem;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .btn-outline {
          border-color: var(--white);
          color: var(--white);

          &:hover {
            background-color: var(--white);
            color: var(--primary-color);
          }
        }
      }
    }

}

.listings-section {
padding: 3rem 0;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;

      h2 {
        color: var(--primary-color);
        font-size: 2rem;
        font-weight: 600;
      }

      .view-controls {
        display: flex;
        gap: 0.5rem;

        .view-btn {
          padding: 0.5rem 1rem;
          border: 2px solid var(--border-color);
          background: var(--white);
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: var(--transition);
          font-size: 0.9rem;

          &:hover {
            border-color: var(--primary-color);
            color: var(--primary-color);
          }

          &.active {
            background: var(--primary-color);
            color: var(--white);
            border-color: var(--primary-color);
          }
        }
      }
    }

    .listings-content {
      .listings-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 2rem;
      }

      .no-listings {
        grid-column: 1 / -1;
        display: flex;
        justify-content: center;
        padding: 4rem 0;

        .no-listings-content {
          text-align: center;
          max-width: 400px;

          .no-listings-icon {
            font-size: 4rem;
            display: block;
            margin-bottom: 1rem;
            opacity: 0.5;
          }

          h3 {
            color: var(--text-color);
            margin-bottom: 1rem;
            font-size: 1.5rem;
          }

          p {
            color: var(--text-light);
            margin-bottom: 2rem;
            line-height: 1.6;
          }
        }
      }
    }

    .map-view-container {
      background: var(--background-color);
      border-radius: var(--border-radius);
      overflow: hidden;
      box-shadow: var(--shadow);
      height: 600px;
    }

}

.stats-section {
background: var(--background-color);
padding: 3rem 0;

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;

      .stat-card {
        background: var(--white);
        padding: 2rem;
        border-radius: var(--border-radius);
        text-align: center;
        box-shadow: var(--shadow);
        transition: var(--transition);

        &:hover {
          box-shadow: var(--shadow-hover);
          transform: translateY(-4px);
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: var(--text-light);
          font-weight: 500;
        }
      }
    }

}
}

@media (max-width: 768px) {
.home-page {
.hero-section {
padding: 2rem 0;

      .hero-content {
        h1 {
          font-size: 2rem;
        }

        p {
          font-size: 1.1rem;
        }

        .hero-actions {
          flex-direction: column;
          align-items: center;

          .btn-lg {
            width: 100%;
            max-width: 300px;
          }
        }
      }
    }

    .listings-section {
      padding: 2rem 0;

      .section-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;

        h2 {
          font-size: 1.5rem;
        }

        .view-controls {
          width: 100%;
          justify-content: center;
        }
      }

      .listings-content {
        .listings-grid {
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
      }

      .map-view-container {
        height: 400px;
      }
    }

    .stats-section {
      .stats-grid {
        grid-template-columns: 1fr;
        gap: 1rem;

        .stat-card {
          padding: 1.5rem;
        }
      }
    }

}
}

HomePage.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { superbase } from "../integrations/superbase/client.js";
import { useAuth } from "../components/App.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import FilterBar from "../components/FilterBar.jsx";
import ListingCard from "../components/ListingCard.jsx";
import Map from "../components/Map.jsx";
import "../styles/HomePage.css";

const HomePage = () => {
const { user } = useAuth();
const [listings, setListings] = useState([]);
const [filteredListings, setFilteredListings] = useState([]);
const [loading, setLoading] = useState(true);
const [filters, setFilters] = useState({});
const [viewMode, setViewMode] = useState("grid"); // 'grid' ou 'map'

useEffect(() => {
fetchListings();
}, []);

useEffect(() => {
applyFilters();
}, [listings, filters]);

const fetchListings = async () => {
try {
setLoading(true);

      let query = superbase
        .from("listings_2025_10_29_18_05")
        .select(
          `
          *,
          profiles_2025_10_29_18_05!user_id (
            full_name,
            avatar_url
          )
        `
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Récupérer les favoris de l'utilisateur si connecté
      let favoritesData = [];
      if (user) {
        const { data: favorites } = await superbase
          .from("user_favorites_2025_10_29_18_05")
          .select("listing_id")
          .eq("user_id", user.id);

        favoritesData = favorites?.map((f) => f.listing_id) || [];
      }

      // Récupérer les notes moyennes
      const listingsWithExtras = await Promise.all(
        data.map(async (listing) => {
          const { data: ratings } = await superbase
            .from("ratings_2025_10_29_18_05")
            .select("rating")
            .eq("giver_id", listing.user_id);

          const averageRating =
            ratings?.length > 0
              ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
              : 0;

          return {
            ...listing,
            is_favorite: favoritesData.includes(listing.id),
            average_rating: averageRating,
            rating_count: ratings?.length || 0,
          };
        })
      );

      setListings(listingsWithExtras);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }

};

const applyFilters = () => {
let filtered = [...listings];

    if (filters.fruitType) {
      filtered = filtered.filter(
        (listing) => listing.fruit_type === filters.fruitType
      );
    }

    if (filters.priceType) {
      if (filters.priceType === "free") {
        filtered = filtered.filter((listing) => listing.is_free);
      } else if (filters.priceType === "paid") {
        filtered = filtered.filter((listing) => !listing.is_free);
      }
    }

    if (filters.minRating) {
      filtered = filtered.filter(
        (listing) => listing.average_rating >= parseInt(filters.minRating)
      );
    }

    if (filters.availableDate) {
      const filterDate = new Date(filters.availableDate);
      filtered = filtered.filter(
        (listing) => new Date(listing.created_at) >= filterDate
      );
    }

    setFilteredListings(filtered);

};

const handleFiltersChange = (newFilters) => {
setFilters(newFilters);
};

const handleFavoriteToggle = (listingId, isFavorite) => {
setListings((prev) =>
prev.map((listing) =>
listing.id === listingId
? { ...listing, is_favorite: isFavorite }
: listing
)
);
};

if (loading) {
return (

<div className="loading-container">
<div className="loading-spinner"></div>
<p>Chargement des annonces...</p>
</div>
);
}

return (

<div className="home-page">
<Header />

      <main className="main-content">
        <section className="hero-section">
          <div className="container">
            <div className="hero-content">
              <h1>Partagez vos fruits et légumes</h1>
              <p>
                Réduisez le gaspillage alimentaire en partageant vos récoltes
                avec votre communauté
              </p>
              {!user && (
                <div className="hero-actions">
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Rejoindre la communauté
                  </Link>
                  <Link to="/login" className="btn btn-outline btn-lg">
                    Se connecter
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        <FilterBar onFiltersChange={handleFiltersChange} filters={filters} />

        <section className="listings-section">
          <div className="container">
            <div className="section-header">
              <h2>Annonces disponibles ({filteredListings.length})</h2>
              <div className="view-controls">
                <button
                  className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => setViewMode("grid")}
                >
                  📋 Liste
                </button>
                <button
                  className={`view-btn ${viewMode === "map" ? "active" : ""}`}
                  onClick={() => setViewMode("map")}
                >
                  🗺️ Carte
                </button>
              </div>
            </div>

            {viewMode === "grid" ? (
              <div className="listings-content">
                <div className="listings-grid">
                  {filteredListings.length > 0 ? (
                    filteredListings.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                        onFavoriteToggle={handleFavoriteToggle}
                      />
                    ))
                  ) : (
                    <div className="no-listings">
                      <div className="no-listings-content">
                        <span className="no-listings-icon">🍎</span>
                        <h3>Aucune annonce trouvée</h3>
                        <p>
                          Essayez de modifier vos filtres ou soyez le premier à
                          publier une annonce !
                        </p>
                        {user && (
                          <Link
                            to="/create-listing"
                            className="btn btn-primary"
                          >
                            Publier une annonce
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="map-view-container">
                <Map listings={filteredListings} />
              </div>
            )}
          </div>
        </section>

        <section className="stats-section">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{listings.length}</div>
                <div className="stat-label">Annonces actives</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {listings.filter((l) => l.is_free).length}
                </div>
                <div className="stat-label">Offres gratuites</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {new Set(listings.map((l) => l.fruit_type)).size}
                </div>
                <div className="stat-label">Types de fruits/légumes</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>

);
};

export default HomePage;
