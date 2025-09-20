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
      "https://khelinfo-frontend.vercel.app",
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
let leaguesCache = [];
let fixturesCache = [];
let seasonsCache = [];
let officialsCache = [];
let scoresCache = [];

const MAX_LIVE_MATCHES = 10;

// ===== Fetch Functions =====
const fetchCountries = async () => {
  try {
    const { data } = await axios.get(
      `https://cricket.sportmonks.com/api/v2.0/countries?api_token=${API_TOKEN}`
    );
    countriesCache = data.data.map((c) => ({ id: c.id, name: c.name }));
  } catch (err) {
    console.error("Countries fetch error:", err.response?.data || err.message);
  }
};

const fetchRankings = async () => {
  try {
    const { data } = await axios.get(
      "https://cricket.sportmonks.com/api/v2.0/team-rankings",
      { params: { api_token: API_TOKEN } }
    );
    rankingsCache = data.data || [];
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
    const newScores = response.data.data || [];

    // Merge new scores into cache
    newScores.forEach((match) => {
      const index = liveScoresCache.findIndex((m) => m.id === match.id);
      if (index > -1) {
        // Update existing match
        liveScoresCache[index] = match;
      } else {
        // Add new match
        liveScoresCache.push(match);
      }
    });

    // Keep only last MAX_LIVE_MATCHES matches
    if (liveScoresCache.length > MAX_LIVE_MATCHES) {
      liveScoresCache = liveScoresCache.slice(-MAX_LIVE_MATCHES);
    }
  } catch (err) {
    console.error("LiveScores fetch error:", err.response?.data || err.message);
  }
};

const fetchTeams = async () => {
  try {
    const { data } = await axios.get(
      `https://cricket.sportmonks.com/api/v2.0/teams?api_token=${API_TOKEN}`
    );
    teamsCache = data.data.map((team) => ({
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
    const { data } = await axios.get(
      `https://cricket.sportmonks.com/api/v2.0/players?api_token=${API_TOKEN}`
    );
    playersCache = data.data.map((p) => ({
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

const fetchLeagues = async () => {
  try {
    const { data } = await axios.get(
      `https://cricket.sportmonks.com/api/v2.0/leagues?api_token=${API_TOKEN}`
    );
    leaguesCache = data.data || [];
  } catch (err) {
    console.error("Leagues fetch error:", err.response?.data || err.message);
  }
};

const fetchFixtures = async () => {
  try {
    const { data } = await axios.get(
      `https://cricket.sportmonks.com/api/v2.0/fixtures?api_token=${API_TOKEN}`
    );
    fixturesCache = data.data || [];
  } catch (err) {
    console.error("Fixtures fetch error:", err.response?.data || err.message);
  }
};

const fetchSeasons = async () => {
  try {
    const { data } = await axios.get(
      `https://cricket.sportmonks.com/api/v2.0/seasons?api_token=${API_TOKEN}`
    );
    seasonsCache = data.data || [];
  } catch (err) {
    console.error("Seasons fetch error:", err.response?.data || err.message);
  }
};

const fetchOfficials = async () => {
  try {
    const { data } = await axios.get(
      `https://cricket.sportmonks.com/api/v2.0/officials?api_token=${API_TOKEN}`
    );
    officialsCache = data.data || [];
  } catch (err) {
    console.error("Officials fetch error:", err.response?.data || err.message);
  }
};

const fetchScores = async () => {
  try {
    const { data } = await axios.get(
      `https://cricket.sportmonks.com/api/v2.0/scores?api_token=${API_TOKEN}`
    );
    scoresCache = data.data || [];
  } catch (err) {
    console.error("Scores fetch error:", err.response?.data || err.message);
  }
};

// ===== Initial Fetch =====
fetchCountries();
fetchRankings();
fetchTeams();
fetchPlayers();
fetchLiveScores();
fetchLeagues();
fetchFixtures();
fetchSeasons();
fetchOfficials();
fetchScores();

// ===== Intervals =====
// Live scores every 3 sec
setInterval(fetchLiveScores, 3000);

// Rankings every 5 minutes
setInterval(fetchRankings, 5 * 60 * 1000);

// Static data every 1 hour
setInterval(fetchCountries, 60 * 60 * 1000);
setInterval(fetchTeams, 60 * 60 * 1000);
setInterval(fetchPlayers, 60 * 60 * 1000);
setInterval(fetchLeagues, 60 * 60 * 1000);
setInterval(fetchFixtures, 60 * 60 * 1000);
setInterval(fetchSeasons, 60 * 60 * 1000);
setInterval(fetchOfficials, 60 * 60 * 1000);
setInterval(fetchScores, 60 * 60 * 1000);

// ===== Routes =====
app.get("/api/countries", (req, res) => res.json({ data: countriesCache }));
app.get("/api/rankings", (req, res) => res.json({ data: rankingsCache }));
app.get("/api/livescores", (req, res) => res.json({ data: liveScoresCache }));
app.get("/api/teams", (req, res) => res.json({ data: teamsCache }));
app.get("/api/players", (req, res) => res.json({ data: playersCache }));
app.get("/api/leagues", (req, res) => res.json({ data: leaguesCache }));
app.get("/api/fixtures", (req, res) => res.json({ data: fixturesCache }));
app.get("/api/seasons", (req, res) => res.json({ data: seasonsCache }));
app.get("/api/officials", (req, res) => res.json({ data: officialsCache }));
app.get("/api/scores", (req, res) => res.json({ data: scoresCache }));
app.get("/api/ping", (req, res) => res.status(200).send("pong"));

// ===== Start Server =====
app.listen(5000, () => console.log("✅ Server running on port 5000"));
