import express from 'express';
import PocketBase from 'pocketbase';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { LLMCall } from "./ai.js";

dotenv.config();

const app = express();
const pb = new PocketBase(process.env.PB_URL || 'http://127.0.0.1:8090');

app.use(express.json());
app.use(cors()); 
app.use(morgan('dev')); 

async function login() {
    try {
        if (!pb.authStore.isValid) {
            await pb.admins.authWithPassword(process.env.PB_ADMIN_EMAIL, process.env.PB_ADMIN_PASSWORD);
            console.log('✅ Admin logged in successfully!');
        } else {
            console.log('🔐 Already authenticated!');
        }
    } catch (error) {
        console.error('❌ Login error:', error.message);
        process.exit(1);
    }
}

app.post('/api/rooms', async (req, res) => {
    const { roomId, name } = req.body;

    try {
        const data = {
            room_id: roomId.toString(),  
            room_name: name,
            content: [],
            summary_generated: false,
            summary: "",
        };

        const newRoom = await pb.collection('Foss').create(data);

        res.status(201).json({
            message: "✅ Room created successfully!",
            room: newRoom
        });
    } catch (error) {
        res.status(500).json({ message: "❌ Error creating room", error: error.message });
    }
});


app.post('/api/rooms/:roomId/content', async (req, res) => {
    const { roomId } = req.params;
    const { selection, xpath, page_url, createdBy } = req.body;

    try {
        console.log(`🔍 Searching for Room with ID: ${roomId}`);

        
        const room = await pb.collection('Foss').getFirstListItem(`room_id="${roomId}"`);

        if (!room) {
            return res.status(404).json({ message: "❌ Room not found" });
        }

        console.log("✅ Room Found:", room);

        if (room.summary_generated) {
            return res.status(400).json({ message: "❌ Cannot modify room. Summary already generated." });
        }

        const newContent = {
            content_id: room.content.length + 1,  
            selection,
            xpath,
            page_url,
            created_at: new Date().toISOString(),
            created_by: createdBy || "Anonymous"
        };

        console.log("🛠️ New Content:", newContent);

        const updatedContent = Array.isArray(room.content) ? [...room.content, newContent] : [newContent];

        console.log("📌 Updated Content Array:", updatedContent);

        await pb.collection('Foss').update(room.id, { content: updatedContent });

        res.status(200).json({
            message: "✅ Content added successfully!",
            content: updatedContent
        });

    } catch (error) {
        console.error("❌ Error adding content:", error);

        if (error?.response?.status === 403) {
            return res.status(403).json({ message: "❌ Permission denied. Only superusers can perform this action." });
        }

        res.status(500).json({ message: "❌ Error adding content", error: error.message });
    }
});

app.delete('/api/rooms/:roomId', async (req, res) => {
    const { roomId } = req.params;

    try {
        console.log(`🗑️ Deleting Room with ID: ${roomId}`);

        const room = await pb.collection('Foss').getFirstListItem(`room_id="${roomId}"`);

        if (!room) {
            return res.status(404).json({ message: "❌ Room not found" });
        }

        console.log("✅ Room Found:", room);

        await pb.collection('Foss').delete(room.id);

        res.status(200).json({
            message: `✅ Room with ID ${roomId} deleted successfully!`
        });

    } catch (error) {
        console.error("❌ Error deleting room:", error);

        res.status(500).json({ message: "❌ Error deleting room", error: error.message });
    }
});


app.post("/api/rooms/:roomId/llm", async (req, res) => {
  const { roomId } = req.params;

  try {
      console.log(`📖 Generating summary for Room ID: ${roomId}`);

      const room = await pb.collection('Foss').getFirstListItem(`room_id="${roomId}"`);

      if (!room) {
          return res.status(404).json({ message: "❌ Room not found" });
      }

      if (room.summary_generated) {
          return res.status(400).json({ message: "❌ Summary already generated." });
      }

      const contentText = room.content.map(item => item.selection).join(" ");

      const summary = await LLMCall(contentText);

      await pb.collection('Foss').update(room.id, {
          summary,
          summary_generated: true
      });

      res.status(200).json({
          message: "✅ Summary generated and saved successfully!",
          summary
      });
  } catch (error) {
      console.error("❌ Error generating summary:", error);
      res.status(500).json({ message: "❌ Error generating summary", error: error.message });
  }
});


const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await login();
        app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
    } catch (error) {
        console.error('❌ Startup error:', error.message);
        process.exit(1);
    }
};

startServer();
