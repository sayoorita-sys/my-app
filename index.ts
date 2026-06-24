import "dotenv/config";
import express from "express";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

// PostgreSQL への接続準備
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ["query"] });

// ここを追加！prisma の中に何が入っているか表示させるのじゃ
console.log("Prisma の中身を確認するぞ:", Object.keys(prisma));

const app = express();
const PORT = process.env.PORT || 8888;

// EJS を使って画面を表示するための設定
app.set("view engine", "ejs");
app.set("views", "./views");
// フォームから送られてきたデータを受け取れるようにする
app.use(express.urlencoded({ extended: true }));

// トップページ：ユーザー一覧を表示する
app.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.render("index", { users });
});

// ユーザー追加：フォームからのデータを受け取って DB に保存する
app.post("/users", async (req, res) => {
  const { name, age } = req.body;
  if (name) {
    // age があれば数値に変換して保存する
    await prisma.user.create({
      data: {
        name,
        age: age ? parseInt(age) : null,
      },
    });
  }
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
