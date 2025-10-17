This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Tải package cho UI
npm install react-hot-toast
npm install keen-slider
npm install lucide-react
npm install react-country-flag
npm install framer-motion

## Web sử dụng để chuyển văn bản thành âm thanh
1. https://luvvoice.com/
2.  

## Chức năng của các trang
1. (marketing): Trang chủ
2. account: Trang hiển thị và chỉnh sửa thông tin cá nhân
3. course: Trang học tập chính, hiển thị danh sách chương và bài học
4. choose: Trang chọn ngôn ngữ
5. login: Trang đăng nhập
6. forgot: Trang quên pass
7. reset: Trang lấy lại pass
8. signup: Trang đăng kí
9. Các components:
- ui: button.tsx cho các nút
- footer, header
- layout: gồm header, footer và phần nội dung, có logic tạm của logout (chỉ điều hướng chứ chưa làm gì)
- loading: cái trang loading lúc người dùng chuyển trang (không sửa lúc merge)
- scroll-reveal: hiệu ứng lướt lên dùng trong marketing\page.tsx (không sửa lúc merge)
- user-progress: gồm icon cờ, chuỗi và điểm
- unit-lesson: gọi đến unit tương ứng với ngôn ngữ và các lesson tương ứng với unit
- crying: Mặt khóc lúc không tìm được chương/bài học
10. lesson: Trang bài học, hiển thị vocab và nút bắt đầu làm bài
11. challenge: Trang challenge