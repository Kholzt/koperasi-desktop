import { body, validationResult } from "express-validator";
import db from "../config/db.js";

export default class GroupController {
  static async index(req, res) {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const [rows] = await db.query(
        "SELECT g.id AS group_id, g.group_name, g.area_id,a.id AS area_id, a.area_name AS area_name,u.id AS staff_id,u.complete_name AS staff_name FROM `groups`  g JOIN areas a ON g.area_id = a.id LEFT JOIN group_details gd ON gd.group_id = g.id AND gd.deleted_at IS NULL LEFT JOIN users u ON gd.staff_id = u.id WHERE g.deleted_at IS NULL AND g.group_name LIKE ? ORDER BY g.id DESC LIMIT ? OFFSET ?", [`%${search}%`, parseInt(limit), offset]
      );

      const [[{ total }]] = await db.query(
        "SELECT COUNT(*) as total FROM `groups` WHERE deleted_at IS NULL AND group_name LIKE ?",
        [`%${search}%`]
      );

      // Grouping
      const map = new Map();
      for (const row of rows) {
        if (!map.has(row.group_id)) {
          map.set(row.group_id, {
            id: row.group_id,
            group_name: row.group_name,
            area_id: row.area_id,
            area: {
              id: row.area_id,
              area_name: row.area_name
            },
            staffs: []
          });
        }

        if (row.staff_id) {
          map.get(row.group_id).staffs.push({
            id: row.staff_id,
            complete_name: row.staff_name
          });
        }
      }

      const groups = Array.from(map.values());
      res.status(200).json({
        groups,
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

  static async show(req, res) {
    try {
      const { id } = req.params;

      const [rows] = await db.query(
        `SELECT
          g.id AS group_id, g.group_name, g.area_id,
          a.id AS area_id, a.area_name AS area_name,
          u.id AS staff_id, u.complete_name AS staff_name
        FROM \`groups\` g
        JOIN areas a ON g.area_id = a.id
        LEFT JOIN group_details gd ON gd.group_id = g.id AND gd.deleted_at IS NULL
        LEFT JOIN users u ON gd.staff_id = u.id
        WHERE g.deleted_at IS NULL AND g.id = ?`,
        [id]
      );

      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: "Group tidak ditemukan" });
      }

      // Ambil data group (hanya satu karena by id)
      const row = rows[0];
      const group = {
        id: row.group_id,
        group_name: row.group_name,
        area_id: row.area_id,
        area: {
          id: row.area_id,
          area_name: row.area_name,
        },
        staffs: [],
      };

      // Tambahkan semua staff (jika ada)
      for (const r of rows) {
        if (r.staff_id) {
          group.staffs.push({
            id: r.staff_id,
            complete_name: r.staff_name,
          });
        }
      }

      res.status(200).json({ group });
    } catch (error) {
      res.status(500).json({ error: "Terjadi kesalahan saat mengambil data group." });
    }
  }


  static async store(req, res) {
    await body("group_name").notEmpty().withMessage("Nama Group wajib diisi").run(req);
    await body("area_id").notEmpty().withMessage("Area wajib diisi").run(req);
    await body("staffs").isArray({ min: 1 }).withMessage("Staff harus berupa array dan minimal 1 item").run(req);
    await body("staffs.*").notEmpty().withMessage("Setiap item staff wajib diisi").run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().reduce((acc, error) => {
        acc[error.param] = error.msg;
        return acc;
      }, {});
      return res.status(400).json({ errors: formattedErrors });
    }

    try {
      const { group_name, area_id, staffs } = req.body;
      const [existingGroup] = await db.query("SELECT * FROM `groups` WHERE group_name = ?", [group_name]);
      if (existingGroup.length > 0) {
        return res.status(400).json({ errors: { group_name: "Nama group sudah ada" } });
      }

      const [result] = await db.query(
        "INSERT INTO `groups` (group_name, area_id) VALUES (?, ?)",
        [group_name, area_id]
      );

      await Promise.all(
        staffs.map((staff) =>
          db.query(
            "INSERT INTO group_details (staff_id, group_id) VALUES (?, ?)",
            [staff, result.insertId]
          )
        )
      );

      const [newGroup] = await db.query("SELECT * FROM `groups` WHERE id = ?", [result.insertId]);

      res.status(201).json({
        message: "Group berhasil dibuat",
        group: newGroup[0],
      });
    } catch (error) {
      res.status(500).json({ error: "An error occurred while creating the group. " + error.message });
    }
  }

  static async update(req, res) {
    await body("group_name").notEmpty().withMessage("Nama Group wajib diisi").run(req);
    await body("area_id").notEmpty().withMessage("Area wajib diisi").run(req);
    await body("staffs").isArray({ min: 1 }).withMessage("Staff harus berupa array dan minimal 1 item").run(req);
    await body("staffs.*").notEmpty().withMessage("Setiap item staff wajib diisi").run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().reduce((acc, error) => {
        acc[error.param] = error.msg;
        return acc;
      }, {});
      return res.status(400).json({ errors: formattedErrors });
    }

    try {
      const { id } = req.params;
      const { group_name, area_id, staffs } = req.body;

      const [existingGroup] = await db.query("SELECT * FROM `groups` WHERE id = ?", [id]);
      if (!existingGroup || existingGroup.length === 0) {
        return res.status(404).json({ error: "Group tidak ditemukan" });
      }

      const [groupByGroupName] = await db.query(
        "SELECT * FROM `groups` WHERE group_name = ? AND id <> ?",
        [group_name, id]
      );
      if (groupByGroupName.length > 0) {
        return res.status(400).json({ errors: { group_name: "Nama group sudah terdaftar" } });
      }

      await db.query(
        "UPDATE `groups` SET group_name = ?, area_id = ? WHERE id = ?",
        [group_name, area_id, id]
      );

      await db.query(
        "UPDATE group_details SET deleted_at = ? WHERE group_id = ?",
        [new Date(), id]
      );

      await Promise.all(
        staffs.map((staff) =>
          db.query(
            "INSERT INTO group_details (staff_id, group_id) VALUES (?, ?)",
            [staff, id]
          )
        )
      );

      res.status(201).json({ message: "Group updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "An error occurred while updating the group. " + error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const [group] = await db.query("SELECT * FROM `groups` WHERE id = ?", [id]);
      if (!group || group.length === 0) {
        return res.status(404).json({ error: "Group tidak ditemukan" });
      }

      await db.query(
        "UPDATE `groups` SET deleted_at = ? WHERE id = ?",
        [new Date(), id]
      );

      res.status(200).json({
        message: "Group berhasil dihapus",
        group: group[0],
      });
    } catch (error) {
      res.status(500).json({ error: "An error occurred while deleting the group. " + error.message });
    }
  }
}
