import { useEffect, useState } from "react";
import LogoutButton from "../components/global/LogoutButton";

export default function ProfilePage() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);

  // Editable fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const res = await fetch(`${BACKEND_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setProfile(data);

      // Initialize editing fields
      setName(data.name || "");
      setEmail(data.email || "");
      setBirthday(data.birthday || "");
    };

    loadProfile();
  }, [BACKEND_URL, token]);

  if (!profile) return <div>Loading...</div>;

  const avatarUrl = profile.avatarUrl
    ? `${BACKEND_URL}${profile.avatarUrl}`
    : null;

  // --------------------------
  // Avatar upload handler
  // --------------------------
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

  // --------------------------
  // Save profile edits
  // --------------------------
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
      setEditing(false);
    } else {
      alert("Failed to update profile");
    }
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "40px auto",
        padding: "30px",
        background: "white",
        borderRadius: 12,
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: 30 }}>My Profile</h1>

      {/* Hidden file input for avatar */}
      <input
        type="file"
        id="avatarInput"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleAvatarUpload}
      />

      {/* Avatar – click to upload */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 30,
          cursor: "pointer",
        }}
        onClick={() => document.getElementById("avatarInput").click()}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="avatar"
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "#ddd",
              fontSize: 40,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
            }}
          >
            {profile.utorid[0].toUpperCase()}
          </div>
        )}
      </div>

      {/* Info Section */}
      {!editing ? (
        <div style={{ fontSize: 18, lineHeight: "1.8" }}>
          <p><strong>UTORid:</strong> {profile.utorid}</p>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Birthday:</strong> {profile.birthday || "N/A"}</p>
          <p><strong>Role:</strong> {profile.role}</p>
          <p><strong>Points:</strong> {profile.points}</p>
          <p><strong>Created At:</strong> {new Date(profile.createdAt).toLocaleString()}</p>
          <p><strong>Last Login:</strong> {new Date(profile.lastLogin).toLocaleString()}</p>
        </div>
      ) : (
        <div style={{ fontSize: 18, lineHeight: "1.8" }}>
          <label>
            <strong>Name:</strong><br />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: 8, marginBottom: 10 }}
            />
          </label>

          <label>
            <strong>Email:</strong><br />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: 8, marginBottom: 10 }}
            />
          </label>

          <label>
            <strong>Birthday:</strong><br />
            <input
              type="date"
              value={birthday || ""}
              onChange={(e) => setBirthday(e.target.value)}
              style={{ width: "100%", padding: 8, marginBottom: 10 }}
            />
          </label>
        </div>
      )}

      {/* Buttons */}
      <div style={{ marginTop: 30, textAlign: "center" }}>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            style={{
              backgroundColor: "#1976d2",
              color: "white",
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              marginRight: 10
            }}
          >
            Edit
          </button>
        ) : (
          <>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: "#4caf50",
                color: "white",
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                marginRight: 10
              }}
            >
              Save
            </button>

            <button
              onClick={() => setEditing(false)}
              style={{
                backgroundColor: "#9e9e9e",
                color: "white",
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
          </>
        )}

        <div style={{ marginTop: 20 }}>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
