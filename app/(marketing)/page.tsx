"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CheckCircle, ChevronRight, ChevronLeft } from "lucide-react"
import Image from "next/image"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import ReactCountryFlag from "react-country-flag"

function AutoplayPlugin(interval = 2000) {
  return (slider: any) => {
    let timeout: any
    let mouseOver = false

    function clearNextTimeout() {
      clearTimeout(timeout)
    }
    function nextTimeout() {
      clearTimeout(timeout)
      if (mouseOver) return
      timeout = setTimeout(() => {
        slider.next()
      }, interval)
    }

    slider.on("created", () => {
      slider.container.addEventListener("mouseover", () => {
        mouseOver = true
        clearNextTimeout()
      })
      slider.container.addEventListener("mouseout", () => {
        mouseOver = false
        nextTimeout()
      })
      nextTimeout()
    })
    slider.on("dragStarted", clearNextTimeout)
    slider.on("animationEnded", nextTimeout)
    slider.on("updated", nextTimeout)
  }
}

export default function Home() {
  const router = useRouter()

 const [sliderRef, instanceRef] = useKeenSlider(
  {
    slides: { perView: 4, spacing: 16 },
    loop: true,
    renderMode: "performance", 
    drag: true, 
  },
  [AutoplayPlugin(2500)]
)

  const students = [
    { id: 1, name: "Học viên 1", img: "/images/student1.jpg", review: "AAAP giúp mình tự tin giao tiếp hơn." },
    { id: 2, name: "Học viên 2", img: "/images/student2.jpg", review: "Mỗi ngày học một ít nhưng tiến bộ rõ rệt." },
    { id: 3, name: "Học viên 3", img: "/images/student3.jpg", review: "Thầy cô và cộng đồng rất nhiệt tình." },
    { id: 4, name: "Học viên 4", img: "/images/student4.jpg", review: "Mình yêu thích phương pháp học này." },
    { id: 5, name: "Học viên 5", img: "/images/student5.jpg", review: "Học từ vựng dễ nhớ và thực tế." },
    { id: 6, name: "Học viên 6", img: "/images/student6.jpg", review: "AAAP tạo động lực cho mình luyện tập mỗi ngày." },
    { id: 7, name: "Học viên 7", img: "/images/student7.jpg", review: "Chỉ vài tháng mình đã cải thiện nhiều kỹ năng." },
  ]

  const languages = [
    { id: "fr", label: "Tiếng Pháp", code: "FR" },
    { id: "en", label: "Tiếng Anh", code: "GB" },
    { id: "zh", label: "Tiếng Trung", code: "CN" },
    { id: "ar", label: "Tiếng Ả Rập", code: "SA" },
  ]

  return (
    <div className="px-8 py-12">
      {/* Hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
        <div>
          <h1 className="text-2xl font-bold mb-6">Một từ khởi đầu - Một thế giới mở ra</h1>
          <p className="text-justify">
            AAAP Polyglot ra đời để đồng hành cùng người Việt trên hành trình học ngoại ngữ.
            Từng bài học nhỏ, từng từ vựng mới là một bước tiến gần hơn tới thế giới.
            Hãy bắt đầu từ hôm nay để tự tin khám phá và chinh phục những cơ hội mới.
          </p>
          <Button variant="secondary" onClick={() => router.push("/login")} className="mt-6 cursor-pointer">
            Bắt đầu học ngay!
          </Button>
        </div>
        <div className="flex justify-center">
          <img
            src="/images/learning.png"
            alt="AAAP Polyglot"
            className="max-w-sm rounded-xl shadow-md"
          />
        </div>
      </div>

      {/* Lý do chọn */}
      <h1 className="text-2xl font-bold text-center mb-10">Lí do chọn AAAP</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-6 h-6 text-pink-400" />
              <h3 className="font-semibold text-lg">Lý do {i}</h3>
            </div>
            <p className="text-gray-600 text-sm">Đây là đoạn mô tả chi tiết cho lý do {i}.</p>
          </div>
        ))}
      </div>
      {/* carousel */}
      <h1 className="text-2xl font-bold text-center my-10">Các chiến binh AAAP nói gì</h1>
      <div className="relative">
        <div ref={sliderRef} className="keen-slider">
          {students.map((s) => (
            <div
  key={s.id}
  className="keen-slider__slide flex flex-col items-center p-4">
  <Image
    src={s.img}
    alt={s.name}
    width={150}
    height={150}
    className="rounded-full mb-4 object-cover"
  />
  <p className="text-sm text-gray-600 text-center">"{s.review}"</p>
  <span className="mt-2 font-semibold">{s.name}</span>
</div>

          ))}
        </div>
        {/* Nút xoay */}
        <button
          onClick={() => instanceRef.current?.prev()}
          className="absolute top-1/2 -left-6 transform -translate-y-1/2 bg-white shadow rounded-full p-2"
        >
          <ChevronLeft className="w-5 h-5 cursor-pointer" />
        </button>
        <button
          onClick={() => instanceRef.current?.next()}
          className="absolute top-1/2 -right-6 transform -translate-y-1/2 bg-white shadow rounded-full p-2 "
        >
          <ChevronRight className="w-5 h-5 cursor-pointer" />
        </button>
      </div>

      {/* flags */}
      <h1 className="text-2xl font-bold text-center my-10">
        Bắt đầu ngay với ngoại ngữ bạn yêu thích
      </h1>
      <div className="flex justify-center gap-8 flex-wrap">
        {languages.map((lang) => (
          <Button key={lang.id} variant="secondaryOutline" className="flex items-center gap-2 cursor-pointer" onClick={() => router.push(`/login?lang=${lang.id}`)}>
            <ReactCountryFlag
              countryCode={lang.code}
              svg
              style={{
                width: "1.5em",
                height: "1.5em",
                borderRadius: "2px",
              }}
            />
            {lang.label}
            <ChevronRight className="w-4 h-4" />
          </Button>
        ))}
      </div>
      <div className="text-center mt-10">
        <Button variant="secondary"className="cursor-pointer" onClick={() => router.push("/login")}>
          Khám phá thêm
        </Button>
      </div>
    </div>
  )
}