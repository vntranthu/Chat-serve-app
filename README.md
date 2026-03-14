# Chat-serve-app

Mini app chatbot AI chạy bằng Node.js, gồm:

- Giao diện chat web đơn giản.
- API `POST /api/chat`.
- Hỗ trợ gọi OpenAI Responses API nếu có `OPENAI_API_KEY`.
- Tự động fallback chatbot local nếu chưa cấu hình API key.

## Chạy nhanh

```bash
npm start
```

App chạy tại `http://localhost:3000`.

## Cấu hình OpenAI (tuỳ chọn)

```bash
export OPENAI_API_KEY="your_key"
export OPENAI_MODEL="gpt-4o-mini"
npm start
```

Nếu chưa có key, app vẫn hoạt động ở chế độ local.
