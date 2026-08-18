# VartaPrimeNews Panels और Integration Setup

## Panel URLs

- Public website: `/`
- Admin: `/admin`
- Authorised Reporter: `/reporter`
- Citizen Reporter: `/citizen-reporter`
- WhatsApp/Telegram reporter simulator: `/reporter-bot`

## Render Environment Variables

Render Dashboard → Service → Environment में `.env.example` के variables भरें।

सबसे पहले ये अनिवार्य रखें:

- `PUBLIC_SITE_URL=https://vartaprimenews.onrender.com`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `REPORTER_USERNAME`
- `REPORTER_PASSWORD`
- `REPORTER_BOT_SECRET`

## GitPit

GitPit backend में एक authenticated POST webhook बनाना होगा। उसका URL
`GITPIT_NEWS_WEBHOOK_URL` और दोनों projects में समान secret
`GITPIT_NEWS_SECRET` रखें। Admin द्वारा `Top/Hero` या `Breaking` खबर approve
होते ही VartaPrimeNews headline, summary, image और article link भेजेगा।

## Telegram

BotFather से bot token लेकर `TELEGRAM_BOT_TOKEN`, target channel/group का ID
`TELEGRAM_NEWS_CHAT_ID`, और webhook सुरक्षा के लिए random
`TELEGRAM_WEBHOOK_SECRET` रखें। Incoming webhook URL:

`https://vartaprimenews.onrender.com/api/reporter/telegram-webhook`

## WhatsApp

Meta WhatsApp Cloud API से access token, phone number ID, app secret और verify
token प्राप्त कर `.env.example` के matching variables में रखें। Webhook URL:

`https://vartaprimenews.onrender.com/api/reporter/whatsapp-webhook`

WhatsApp production messaging template/opt-in नियम Meta account में पूरे करने
होंगे। किसी token को GitHub या ZIP की source files में सीधे न लिखें।

## Editorial Safety

- Citizen reports हमेशा Pending queue में जाती हैं।
- Citizen “Breaking” या “Top” निर्धारित नहीं कर सकता।
- केवल Admin approval के बाद publication होता है।
- केवल approved Top/Hero या Breaking news external channels पर जाती है।
