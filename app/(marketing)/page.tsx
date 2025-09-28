"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Lightbulb, Target, MessageCircle, ChevronRight, ChevronLeft } from "lucide-react"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import ReactCountryFlag from "react-country-flag"
import ScrollReveal from "@/components/scroll-reveal"

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
      mode: "free-snap",
      breakpoints: {
        "(max-width: 1024px)": { slides: { perView: 3, spacing: 12 } },
        "(max-width: 768px)": { slides: { perView: 2, spacing: 8 } },
        "(max-width: 480px)": { slides: { perView: 1, spacing: 4 } },
      },
    },
    [AutoplayPlugin(2500)]
  )

  const students = [
    { id: 1, name: "Học viên 1", img: "https://i.pravatar.cc/150?u=1", review: "AAAP giúp mình tự tin giao tiếp hơn. Trước đây mình rất ngại nói chuyện với người nước ngoài, nhưng giờ mình có thể tham gia các lớp học nhóm và tự tin thực hành mỗi ngày." },
    { id: 2, name: "Học viên 2", img: "https://i.pravatar.cc/150?u=2", review: "Mỗi ngày học một ít nhưng tiến bộ rõ rệt. Mình đặc biệt thích các bài học từ vựng theo chủ đề, vừa dễ nhớ vừa thực tế." },
    { id: 3, name: "Học viên 3", img: "https://i.pravatar.cc/150?u=3", review: "Bốn cô và cộng đồng rất nhiệt tình. Các cô luôn giải đáp thắc mắc, còn cộng đồng học viên giúp mình duy trì động lực học tập." },
    { id: 4, name: "Học viên 4", img: "https://i.pravatar.cc/150?u=12", review: "Mình yêu thích phương pháp học này. Các bài học ngắn gọn, dễ áp dụng, giúp mình học hiệu quả mà không bị áp lực." },
    { id: 5, name: "Học viên 5", img: "https://i.pravatar.cc/150?u=5", review: "Học từ vựng dễ nhớ và thực tế. Mình có thể áp dụng ngay trong giao tiếp hàng ngày và công việc." },
    { id: 6, name: "Học viên 6", img: "https://i.pravatar.cc/150?u=9", review: "AAAP tạo động lực cho mình luyện tập mỗi ngày. Nhờ có lịch trình rõ ràng và bài tập thú vị, mình không bao giờ bỏ lỡ buổi học nào." },
    { id: 7, name: "Học viên 7", img: "https://i.pravatar.cc/150?u=7", review: "Chỉ vài tháng mình đã cải thiện nhiều kỹ năng. Mình đặc biệt tiến bộ trong đọc hiểu." },
  ]

  const reasons = [
    { 
      title: "Nội dung dễ hiểu", 
      icon: <Lightbulb className="w-6 h-6 text-pink-400" />,
      description: "Các bài học được thiết kế đơn giản, dễ tiếp thu, giúp bạn học nhanh mà không bị rối." 
    },
    { 
      title: "Học có mục tiêu", 
      icon: <Target className="w-6 h-6 text-pink-400" />,
      description: "Mỗi bài học, mỗi chủ đề đều có mục tiêu rõ ràng, giúp bạn biết mình tiến bộ ở đâu." 
    },
    { 
      title: "Tương tác thú vị", 
      icon: <MessageCircle className="w-6 h-6 text-pink-400" />,
      description: "Các trò chơi và bài tập nhỏ giúp việc học sinh động, không nhàm chán." 
    },
  ]
  const languages = [
    { id: "fr", label: "Tiếng Pháp", code: "FR" },
    { id: "en", label: "Tiếng Anh", code: "GB" },
    { id: "zh", label: "Tiếng Trung", code: "CN" },
    { id: "ar", label: "Tiếng Ả Rập", code: "SA" },
  ]

  return (
    <div className="px-8 py-12">
      <ScrollReveal className="mb-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
        <div>
          <h1 className="text-2xl font-bold mb-6">Một từ khởi đầu - Một thế giới mở ra</h1>
          <p className="text-justify">
            AAAP Polyglot ra đời để đồng hành cùng người Việt trên hành trình học từ vựng ngoại ngữ một cách hiệu quả. 
            Từng bài học nhỏ, từng từ vựng mới là một bước tiến giúp bạn ghi nhớ nhanh và áp dụng linh hoạt trong giao tiếp hàng ngày. 
            Phương pháp học tại AAAP giúp bạn luyện tập đều đặn, tăng dần vốn từ vựng và cải thiện kỹ năng ngôn ngữ qua các bài tập thực tế. 
            Hãy bắt đầu hôm nay, từng chút một, để mỗi ngày bạn đều tiến gần hơn tới mục tiêu mở rộng vốn từ, rèn luyện trí nhớ và cải thiện khả năng ngoại ngữ của bản thân
          </p>
          <Button variant="secondary" onClick={() => router.push("/login")} className="heartbeat hover:scale-110 mt-6 cursor-pointer">
            Bắt đầu học ngay!
          </Button>
        </div>
        <div className="flex justify-center">
          <img src="/learning.png" alt="AAAP Polyglot" className="max-w-sm rounded-xl"/>
        </div>
      </div>
      </ScrollReveal>
      {/* Lý do chọn */}
      <ScrollReveal className="mb-32">
      <h1 className="text-2xl font-bold text-center mb-10">Lí do chọn AAAP</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {reasons.map((r, i) => (
          <div key={i} className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {r.icon}
              <h3 className="font-semibold text-lg">{r.title}</h3>
            </div>
            <p className="text-gray-600 text-sm text-justify">{r.description}</p>
          </div>
        ))}
      </div>
      </ScrollReveal>
      {/* Carousel */}
      <ScrollReveal className="mb-32">
      <h1 className="text-2xl font-bold text-center my-10">Các chiến binh AAAP nói gì</h1>
      <div className="relative">
        <div ref={sliderRef} className="keen-slider w-full min-h-[250px]">
          {students.map((s) => (
            <div key={s.id} className="keen-slider__slide flex flex-col items-center p-4 min-w-[200px]">
              <img src={s.img} alt={s.name} width={150} height={150} className="w-36 h-36 rounded-full mb-4 object-cover shadow-lg border-2 border-pink-200"/>
              <p className="text-sm text-gray-600 text-justify">"{s.review}"</p>
            </div>
          ))}
        </div>
        <button onClick={() => instanceRef.current?.prev()} className="absolute top-1/2 -left-6 transform -translate-y-1/2 bg-white shadow rounded-full p-2">
          <ChevronLeft className="w-5 h-5 cursor-pointer" />
        </button>
        <button onClick={() => instanceRef.current?.next()} className="absolute top-1/2 -right-6 transform -translate-y-1/2 bg-white shadow rounded-full p-2">
          <ChevronRight className="w-5 h-5 cursor-pointer" />
        </button>
      </div>
      </ScrollReveal>
      {/* Bắt đầu ngay với.. */}
      <ScrollReveal className="mb-32">
      <h1 className="text-2xl font-bold text-center my-10">Bắt đầu ngay với ngoại ngữ bạn yêu thích</h1>
      <div className="flex justify-center gap-16 flex-wrap">
        {languages.map((lang) => (
          <Button key={lang.id} variant="secondaryOutline" className="flex items-center gap-2 cursor-pointer"onClick={() => router.push(`/login?lang=${lang.id}`)}>
            <ReactCountryFlag countryCode={lang.code} svg style={{ width: "1.5em", height: "1.5em", borderRadius: "2px" }} />
            {lang.label}
            <ChevronRight className="w-4 h-4" />
          </Button>
        ))}
      </div>
      <div className="text-center mt-10">
        <Button variant="secondary" className="heartbeat hover:scale-110 cursor-pointer" onClick={() => router.push("/login")}>
          Khám phá thêm
        </Button>
      </div>
      </ScrollReveal>
    </div>
  )
}