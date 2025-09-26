"use client"
import {Button} from "@/components/ui/button" 
import { useRouter } from "next/navigation"   
export default function Home() { 
  const router = useRouter()
  return( 
  <div>
    <h1 className="text-2xl font-bold text-center mb-6"> Một từ khởi đầu - Một thế giới mở ra</h1>     
    <p> AAAP Polyglot ra đời để đồng hành cùng người Việt </p>
    <p>trên hành trình học ngoại ngữ. Từng bài học nhỏ, từng </p>
    <p>từ vựng mới là một bước tiến gần hơn tới thế giới.</p>
    <p>Hãy bắt đầu từ hôm nay để tự tin khám phá và chinh phục những cơ hội mới</p>
    <h1 className="text-2xl font-bold text-center mb-6">Lí do chọn AAAP</h1>

    <Button variant="secondary" onClick={() => router.push("/login")}>
      Bắt đầu học ngay!
    </Button>
    <div> </div>
  </div> 
  ) 
}