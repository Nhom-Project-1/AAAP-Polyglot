export const Footer = () => {
  return (
    <footer className="hidden lg:block w-full border-t-2 border-slate-200 bg-gray-50">
      
      <div className="w-full flex justify-between px-4 py-8 relative">
        
        {/* Bên trái */}
        <div className="flex flex-col gap-2 pl-14">
          <h3 className="text-lg font-bold text-pink-300">Về AAAP Polyglot</h3>
          <p className="text-sm text-gray-700">
            AAAP Polyglot - Website đồng hành cùng người Việt trên hành trình học ngoại ngữ
          </p>
        </div>

        {/* Bên phải*/}
        <div className="flex flex-col items-start gap-2 absolute left-[70%] transform -translate-x-1/2 text-gray-700">
          <h3 className="text-lg font-bold text-pink-300">Kết nối với chúng tôi</h3>
          <p className="text-sm">Số 3 Cầu Giấy, Hà Nội</p>
          <p className="text-sm">Email: aaappolyglot@gmail.com</p>
          <p className="text-sm">Điện thoại: 0123 456 789</p>
        </div>
      </div>

      {/* Dòng cuối*/}
      <div className="w-full border-t mt-12 pt-6 text-center text-sm text-pink-400">
        ©2025 AAAP Polyglot - From Words to World
      </div>
    </footer>
  )
}
