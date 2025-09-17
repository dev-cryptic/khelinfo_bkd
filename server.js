// server.js
import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();

// Enable CORS for your frontend
app.use(
  cors({
    origin: [
      "http://localhost:5173",         // local dev
      "https://khelinfo-frontend.vercel.app" // vercel frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

const API_TOKEN = process.env.API_TOKEN;

// === In-memory cache for countries ===
let countriesCache = [];

// ================== Routes ================== //

// 1️⃣ Countries
app.get("/api/countries", async (req, res) => {
  try {
    if (countriesCache.length) {
      return res.json({ data: countriesCache });
    }

    const response = await axios.get(
      `https://cricket.sportmonks.com/api/v2.0/countries?api_token=${API_TOKEN}`
    );

    countriesCache = response.data.data.map((country) => ({
      id: country.id,
      name: country.name,
    }));

    res.json({ data: countriesCache });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res
      .status(err.response?.status || 500)
      .json({ error: "Failed to fetch countries" });
  }
});

// 2️⃣ Team Rankings
app.get("/api/rankings", async (req, res) => {
  try {
    const response = await axios.get(
      "https://cricket.sportmonks.com/api/v2.0/team-rankings",
      {
        params: { api_token: API_TOKEN },
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

// 3️⃣ Live Scores (with runs, batting, bowling)
app.get("/api/livescores", async (req, res) => {
  try {
    const response = await axios.get(
      "https://cricket.sportmonks.com/api/v2.0/livescores",
      {
        params: {
          api_token: API_TOKEN,
          include: "runs,batting,bowling",
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

// 4️⃣ Teams (extra endpoint your frontend needs)
app.get("/api/teams", async (req, res) => {
  try {
    const response = await axios.get(
      `https://cricket.sportmonks.com/api/v2.0/teams?api_token=${API_TOKEN}`
    );

    const teams = response.data.data.map((team) => ({
      id: team.id,
      name: team.name,
      code: team.code,
      image_path: team.image_path,
      country_id: team.country_id,
    }));

    res.json({ data: teams });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ error: "Failed to fetch teams" });
  }
});


app.get("/api/players", async (req, res) => {
  try {
    const response = await axios.get(
      `https://cricket.sportmonks.com/api/v2.0/players?api_token=${API_TOKEN}`
    );

    const players = response.data.data.map((player) => ({
      id: player.id,
      fullname: player.fullname,
      firstname: player.firstname,
      lastname: player.lastname,
      dateofbirth: player.dateofbirth,
      gender: player.gender,
      battingstyle: player.battingstyle,
      bowlingstyle: player.bowlingstyle,
      position: player.position?.name || "N/A",
      country_id: player.country_id,
      image_path: player.image_path,
    }));

    res.json({ data: players });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res
      .status(err.response?.status || 500)
      .json({ error: "Failed to fetch players" });
  }
});

app.get("/ping", (req, res) => {
  res.send("pong");
});



// ================== Start Server ================== //
app.listen(5000, () => console.log("✅ Server running on port 5000"));
