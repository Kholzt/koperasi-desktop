import { body, validationResult } from "express-validator";
import db from "../config/db.js";

export default class MemberController {
  static async index(req, res) {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const [rows] = await db.query(
        "SELECT m.id AS member_id, m.complete_name,m.*, m.area_id,a.id AS area_id, a.area_name AS area_name  FROM `members`  m JOIN areas a ON m.area_id = a.id   WHERE m.deleted_at IS NULL AND m.complete_name LIKE ? ORDER BY m.id DESC LIMIT ? OFFSET ?", [`%${search}%`, parseInt(limit), offset]
      );

      const [[{ total }]] = await db.query(
        "SELECT COUNT(*) as total FROM `members` WHERE deleted_at IS NULL AND complete_name LIKE ?",
        [`%${search}%`]
      );

      // Grouping
      const map = new Map();
      for (const row of rows) {
        if (!map.has(row.member_id)) {
          map.set(row.member_id, {
            id: row.member_id,
            complete_name: row.complete_name,
            address: row.address,
            sequence_number: row.sequence_number,
            area_id: row.area_id,
            area: {
              id: row.area_id,
              area_name: row.area_name
            },
          });
        }
      }

      const members = Array.from(map.values());
      res.status(200).json({
        members,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  static async count(req, res) {
    try {

      const [[{ total }]] = await db.query(
        "SELECT COUNT(*) as total FROM `members` WHERE deleted_at IS NULL "
      );


      res.status(200).json({
          total
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async show(req, res) {
    try {
      const { id } = req.params;

      const [rows] = await db.query(
          "SELECT m.id AS member_id, m.complete_name, m.address, m.area_id,a.id AS area_id, a.area_name AS area_name FROM `members` m  JOIN areas a ON m.area_id = a.id WHERE m.deleted_at IS NULL AND m.id = ?",
        [id]
      );

      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: "Anggota tidak ditemukan" });
      }

      // Ambil data group (hanya satu karena by id)
      const row = rows[0];
      const member = {
        id: row.member_id,
        complete_name: row.complete_name,
        address: row.address,
        area_id: row.area_id,
        area: {
          id: row.area_id,
          area_name: row.area_name,
        },
      };


      res.status(200).json({ member });
    } catch (error) {
      res.status(500).json({ error: "Terjadi kesalahan saat mengambil data group." +error.message });
    }
  }



  static async store(req, res) {
    await body("complete_name").notEmpty().withMessage("Nama wajib diisi").run(req);
    await body("area_id").notEmpty().withMessage("Area wajib diisi").run(req);
    await body('address').notEmpty().withMessage('Alamat wajib diisi').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().reduce((acc, error) => {
        acc[error.path] = error.msg;
        return acc;
      }, {});
      return res.status(400).json({ errors: formattedErrors });
    }

    try {
      const { complete_name, area_id,address } = req.body;
      const [member] = await db.query("SELECT sequence_number FROM `members` ORDER BY created_at DESC LIMIT 1");

    const sequence_number = member[0] ? member[0]?.sequence_number + 1:1;
      const [result] = await db.query(
        "INSERT INTO `members` (complete_name, area_id,address,sequence_number) VALUES (?, ?,?,?)",
        [complete_name, area_id,address,sequence_number]
      );

      const [newMember] = await db.query("SELECT * FROM `members` WHERE id = ?", [result.insertId]);
      res.status(201).json({
        message: "Anggota berhasil dibuat",
        member: newMember[0],
      });
    } catch (error) {
      res.status(500).json({ error: "An error occurred while creating the group. " + error.message });
    }
  }

  static async update(req, res) {
    await body("complete_name").notEmpty().withMessage("Nama wajib diisi").run(req);
    await body("area_id").notEmpty().withMessage("Area wajib diisi").run(req);
    await body('address').notEmpty().withMessage('Alamat wajib diisi').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().reduce((acc, error) => {
        acc[error.path] = error.msg;
        return acc;
      }, {});
      return res.status(400).json({ errors: formattedErrors ,errorss:errors});
    }

    try {
      const { id } = req.params;
      const { complete_name, area_id, address } = req.body;

      await db.query(
        "UPDATE `members` SET complete_name = ?, area_id = ?, address = ? WHERE id = ?",
        [complete_name, area_id,address, id]
      );

      res.status(201).json({ message: "Anggota updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "An error occurred while updating the group. " + error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const [member] = await db.query("SELECT * FROM `members` WHERE id = ?", [id]);
      if (!member || member.length === 0) {
        return res.status(404).json({ error: "Anggota tidak ditemukan" });
      }

      await db.query(
        "UPDATE `members` SET deleted_at = ? WHERE id = ?",
        [new Date(), id]
      );

      res.status(200).json({
        message: "Anggota berhasil dihapus",
        member: member[0],
      });
    } catch (error) {
      res.status(500).json({ error: "An error occurred while deleting the member. " + error.message });
    }
  }
}
