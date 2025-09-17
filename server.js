// server.js
import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const API_TOKEN = process.env.API_TOKEN;

app.use(
  cors({
    origin: [
      "http://localhost:5173",         
      "https://khelinfo-frontend.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());

// ===== In-memory caches =====
let countriesCache = [];
let rankingsCache = [];
let liveScoresCache = [];
let teamsCache = [];
let playersCache = [];

// ===== Fetch Functions =====
const fetchCountries = async () => {
  try {
    const response = await axios.get(
      `https://cricket.sportmonks.com/api/v2.0/countries?api_token=${API_TOKEN}`
    );
    countriesCache = response.data.data.map((c) => ({ id: c.id, name: c.name }));
  } catch (err) {
    console.error("Countries fetch error:", err.response?.data || err.message);
  }
};

const fetchRankings = async () => {
  try {
    const response = await axios.get(
      "https://cricket.sportmonks.com/api/v2.0/team-rankings",
      { params: { api_token: API_TOKEN } }
    );
    rankingsCache = response.data.data || [];
  } catch (err) {
    console.error("Rankings fetch error:", err.response?.data || err.message);
  }
};

const fetchLiveScores = async () => {
  try {
    const response = await axios.get(
      "https://cricket.sportmonks.com/api/v2.0/livescores",
      { params: { api_token: API_TOKEN, include: "runs,batting,bowling" } }
    );
    liveScoresCache = response.data.data || [];
  } catch (err) {
    console.error("LiveScores fetch error:", err.response?.data || err.message);
  }
};

const fetchTeams = async () => {
  try {
    const response = await axios.get(
      `https://cricket.sportmonks.com/api/v2.0/teams?api_token=${API_TOKEN}`
    );
    teamsCache = response.data.data.map((team) => ({
      id: team.id,
      name: team.name,
      code: team.code,
      image_path: team.image_path,
      country_id: team.country_id,
    }));
  } catch (err) {
    console.error("Teams fetch error:", err.response?.data || err.message);
  }
};

const fetchPlayers = async () => {
  try {
    const response = await axios.get(
      `https://cricket.sportmonks.com/api/v2.0/players?api_token=${API_TOKEN}`
    );
    playersCache = response.data.data.map((p) => ({
      id: p.id,
      fullname: p.fullname,
      firstname: p.firstname,
      lastname: p.lastname,
      dateofbirth: p.dateofbirth,
      gender: p.gender,
      battingstyle: p.battingstyle,
      bowlingstyle: p.bowlingstyle,
      position: p.position?.name || "N/A",
      country_id: p.country_id,
      image_path: p.image_path,
    }));
  } catch (err) {
    console.error("Players fetch error:", err.response?.data || err.message);
  }
};

// ===== Initial Fetch =====
fetchCountries();
fetchRankings();
fetchTeams();
fetchPlayers();
fetchLiveScores();

// ===== Intervals =====
// Live scores every 5 sec
setInterval(fetchLiveScores, 5000);

// Rankings every 5 minutes
setInterval(fetchRankings, 5 * 60 * 1000);

// Static data every 1 hour
setInterval(fetchCountries, 60 * 60 * 1000);
setInterval(fetchTeams, 60 * 60 * 1000);
setInterval(fetchPlayers, 60 * 60 * 1000);

// ===== Routes =====
app.get("/api/countries", (req, res) => res.json({ data: countriesCache }));
app.get("/api/rankings", (req, res) => res.json({ data: rankingsCache }));
app.get("/api/livescores", (req, res) => res.json({ data: liveScoresCache }));
app.get("/api/teams", (req, res) => res.json({ data: teamsCache }));
app.get("/api/players", (req, res) => res.json({ data: playersCache }));
app.get("/api/ping", (req, res) => res.status(200).send("pong"));

// ===== Start Server =====
app.listen(5000, () => console.log("✅ Server running on port 5000"));
