import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/global/Button";
import Input from "../components/global/Input";
import "./ProfilePage.css";
import LogoutButton from "../components/global/LogoutButton";

export default function ProfilePage() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Editable fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setProfile(data);
        if (data.avatarUrl) {
          localStorage.setItem("avatarUrl", data.avatarUrl);
        } else {
          localStorage.removeItem("avatarUrl");
        }

        // Initialize editing fields
        setName(data.name || "");
        setEmail(data.email || "");
        setBirthday(data.birthday || "");
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [BACKEND_URL, token]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">😕</div>
          <div className="empty-state-title">Failed to load profile</div>
        </div>
      </div>
    );
  }

  const avatarUrl = profile.avatarUrl
    ? `${BACKEND_URL}${profile.avatarUrl}`
    : null;

  // Avatar upload handler
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    const res = await fetch(`${BACKEND_URL}/users/me`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      const updated = await res.json();
      setProfile(updated);
    } else {
      alert("Failed to upload avatar");
    }

  };

  console.log("avatarUrl:", localStorage.getItem("avatarUrl"));

  
  // Save profile edits
  const handleSave = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    if (birthday) formData.append("birthday", birthday);

    const res = await fetch(`${BACKEND_URL}/users/me`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      const updated = await res.json();
      setProfile(updated);
      if (updated.avatarUrl) {
        localStorage.setItem("avatarUrl", updated.avatarUrl);
      }
      setEditing(false);
    } else {
      alert("Failed to update profile");
    }
  };

  const getRoleBadgeClass = (role) => {
    return `role-badge ${role}`;
  };

  const roleIcons = {
    regular: "👤",
    cashier: "💰",
    manager: "👔",
    superuser: "👑",
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1 className="profile-title">My Profile 👤</h1>
      </div>

      <div className="profile-card">
        {/* Hidden file input for avatar */}
        <input
          type="file"
          id="avatarInput"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleAvatarUpload}
        />

        {/* Avatar Section */}
        <div className="avatar-section">
          <div
            className="avatar-wrapper"
            onClick={() => document.getElementById("avatarInput").click()}
            title="Click to upload avatar"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="avatar-image"
              />
            ) : (
              <div className="avatar-placeholder">
                {profile.utorid[0].toUpperCase()}
              </div>
            )}
          </div>
          <p className="avatar-hint">Click on your avatar to upload a new one</p>
        </div>



        {/* Info Section */}
        <div className="profile-info">
          {!editing ? (
            <>
              <div className="profile-field">
                <span className="profile-field-label">UTORid</span>
                <span className="profile-field-value">{profile.utorid}</span>
              </div>
              
              <div className="profile-field">
                <span className="profile-field-label">Name</span>
                <span className="profile-field-value">{profile.name}</span>
              </div>
              
              <div className="profile-field">
                <span className="profile-field-label">Email</span>
                <span className="profile-field-value">{profile.email}</span>
              </div>
              
              <div className="profile-field">
                <span className="profile-field-label">Birthday</span>
                <span className="profile-field-value">
                  {profile.birthday ? new Date(profile.birthday).toLocaleDateString() : "Not set"}
                </span>
              </div>
              
              <div className="profile-field">
                <span className="profile-field-label">Role</span>
                <span className={`${getRoleBadgeClass(profile.role)}`}>
                  {roleIcons[profile.role] || "👤"} {profile.role}
                </span>
              </div>
              
              <div className="profile-field">
                <span className="profile-field-label">Points Balance</span>
                <span className="profile-field-value" style={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--primary)" }}>
                  ⭐ {profile.points?.toLocaleString() || 0}
                </span>
              </div>
              
              <div className="profile-field">
                <span className="profile-field-label">Member Since</span>
                <span className="profile-field-value">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {profile.lastLogin && (
                <div className="profile-field">
                  <span className="profile-field-label">Last Login</span>
                  <span className="profile-field-value">
                    {new Date(profile.lastLogin).toLocaleString()}
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              <Input
                label="Name"
                value={name}
                onChange={setName}
                placeholder="Enter your name"
              />
              
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="Enter your email"
              />
              
              <Input
                label="Birthday"
                type="date"
                value={birthday || ""}
                onChange={setBirthday}
              />
            </>
          )}
        </div>

        {/* Actions */}
        <div className="profile-actions">
          {!editing ? (
            <>
              <Button onClick={() => setEditing(true)} variant="primary">
                Edit Profile
              </Button>
              <Button onClick={() => navigate("/change-password")} variant="warning">
                Change Password
              </Button>
              <LogoutButton />
            </>
          ) : (
            <>
              <Button onClick={handleSave} variant="success">
                Save Changes
              </Button>
              <Button onClick={() => setEditing(false)} variant="secondary">
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      
    </div>
  );
}
