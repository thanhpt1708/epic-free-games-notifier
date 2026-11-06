# 🎮 Epic Games Weekly Free Games Notifier

Chương trình tự động quét các tựa game đang được **miễn phí hàng tuần trên Epic Games Store** và gửi thông báo trực tiếp qua **Telegram** kèm ảnh bìa, giá gốc, hạn nhận (giờ Việt Nam) và đường link trực tiếp để bạn bấm vào nhận ngay!

Hoạt động hoàn toàn tự động, ổn định và miễn phí 100% qua **GitHub Actions**.

---

## 🌟 Điểm nổi bật
- **100% An toàn:** Không cần tài khoản hay mật khẩu Epic Games, không lo vi phạm điều khoản hay bị khóa tài khoản.
- **Không bao giờ dính Captcha:** Sử dụng trực tiếp API công khai của Epic Games Store.
- **Siêu nhẹ & Nhanh:** Viết bằng Node.js thuần (Zero-dependencies), chạy trên GitHub Actions chỉ mất **3 - 5 giây**.
- **Lịch chạy tối ưu:** Chạy vào **09:00 sáng thứ Sáu hàng tuần** (sau khi Epic đã cập nhật và đồng bộ game mới vào tối thứ Năm).
- **Thông báo đầy đủ:** Gửi ảnh bìa game, giá gốc, thời hạn nhận và thông báo trước cả tựa game sắp tặng vào tuần kế tiếp.

---

## 🚀 Hướng dẫn cài đặt (Chỉ mất 2 phút)

### Bước 1: Tạo Telegram Bot & lấy Token
1. Mở ứng dụng Telegram, tìm bot **`@BotFather`** (có tích xanh xác thực).
2. Gửi lệnh: `/newbot`
3. Nhập tên hiển thị cho bot (ví dụ: `Epic Free Games Notifier`).
4. Nhập username cho bot (phải kết thúc bằng chữ `bot`, ví dụ: `my_epic_loot_bot`).
5. **`@BotFather`** sẽ gửi lại một đoạn mã token có dạng:
   ```text
   7123456789:AAFn8d8xyz...
   ```
   👉 Đây chính là **`TELEGRAM_BOT_TOKEN`**.

### Bước 2: Lấy Chat ID Telegram của bạn
1. Bấm vào bot vừa tạo và nhấn nút **`START`** (hoặc gửi cho bot 1 tin nhắn bất kỳ như `hello`).
2. Tìm bot **`@userinfobot`** trên Telegram và bấm **`START`**.
3. Bot sẽ gửi lại thông tin cá nhân của bạn, trong đó dòng `Id:` là một dãy số (ví dụ: `123456789`).
   👉 Dãy số này chính là **`TELEGRAM_CHAT_ID`**.

> 💡 *Mẹo: Nếu muốn bot gửi thông báo vào một Nhóm (Group) hoặc Kênh (Channel), hãy thêm bot vào nhóm đó và lấy ID của nhóm.*

### Bước 3: Cấu hình Secret trên GitHub Repository
1. Đẩy mã nguồn này lên repository GitHub của bạn (nên để chế độ **Private**).
2. Vào tab **Settings** của repository trên GitHub.
3. Ở menu bên trái, chọn **Secrets and variables** ➡️ chọn **Actions**.
4. Nhấn nút **New repository secret** và thêm lần lượt 2 Secret sau:

| Tên Secret (Name) | Giá trị (Secret) |
| :--- | :--- |
| `TELEGRAM_BOT_TOKEN` | Token nhận từ `@BotFather` ở Bước 1 |
| `TELEGRAM_CHAT_ID` | Dãy số ID nhận từ `@userinfobot` ở Bước 2 |

---

## ⚡ Kiểm tra chạy thử ngay trên GitHub

Bạn không cần phải đợi đến thứ Sáu để xem kết quả:
1. Vào tab **Actions** trên repository GitHub của bạn.
2. Ở danh sách bên trái, chọn workflow **`Epic Games Weekly Free Games Notifier`**.
3. Bấm vào nút **Run workflow** (ở góc phải) ➡️ Chọn branch `main` (hoặc `master`) ➡️ Bấm **Run workflow**.
4. Chờ khoảng 5 giây, bot sẽ gửi ngay thông báo kèm hình ảnh game miễn phí tuần này vào Telegram của bạn!

---

## ⏰ Lịch chạy tự động

Workflow được cấu hình chạy tự động theo lịch cron:
- **Thời gian:** `0 2 * * 5` (tức **02:00 UTC thứ Sáu = 09:00 sáng thứ Sáu giờ Việt Nam**).
- **Lý do chọn thứ Sáu:** Epic Games thường đổi game vào lúc 22:00 tối thứ Năm. Chạy vào sáng thứ Sáu giúp đảm bảo máy chủ Epic đã hoàn tất đồng bộ giá khuyến mại, tránh được trường hợp lỗi dữ liệu tạm thời ngay lúc vừa chuyển giao game.

---

## 💻 Chạy thử nghiệm ở máy cá nhân (Local)

Nếu muốn chạy thử trực tiếp trên máy tính của bạn:

1. Sao chép file cấu hình:
   ```bash
   cp .env.example .env
   ```
2. Điền thông tin vào file `.env`:
   ```env
   TELEGRAM_BOT_TOKEN=điền_token_của_bạn
   TELEGRAM_CHAT_ID=điền_chat_id_của_bạn
   ```
3. Chạy chương trình:
   ```bash
   node --env-file=.env src/index.js
   ```

*(Nếu chỉ muốn chạy thử in kết quả ra màn hình mà không gửi Telegram thật, hãy chạy: `DRY_RUN=true node src/index.js`)*.

