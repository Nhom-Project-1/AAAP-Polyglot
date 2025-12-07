package tests;

import base.BasePage;
import base.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.annotations.Test;

import java.util.List;

import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

public class Unit_Lesson_Vocab extends BaseTest {
    BasePage base;

    @Test
    public void TC1_LessonSelection() throws Exception {
        base = new BasePage(driver);
        base.loginSuccess("Test3", "Test33!!");

        //chọn bài học 1
        base.click(By.xpath("(//div[contains(@class, 'relative flex flex-col items-center')])[1]//div[contains(@class, 'bg-pink-400')]"));

        //kiểm tra tiêu đề
        WebElement lessonTitle = base.waitForElementVisible(
                By.xpath("//h1[contains(., 'Bài học 1') and contains(., 'Buổi Sáng & Ăn Uống (Morning & Meals)')]")
        );
        assertTrue(lessonTitle.isDisplayed(), "❌ Giao diện không hiển thị bài học");

        //kểm tra từ vựng
        List<WebElement> vocabCards = driver.findElements(By.cssSelector("div.border.rounded-xl"));
        assertTrue(vocabCards.size() > 0, "❌ Không có từ vựng nào được hiển thị trong bài học");

        // 6️⃣ Kiểm tra một vài phần tử mẫu (đại diện)
        WebElement firstCard = vocabCards.get(0);
        String firstWordTitle = firstCard.findElement(By.tagName("h3")).getText();
        String firstWordMeaning = firstCard.findElement(By.cssSelector(".text-gray-700")).getText();

        System.out.println("🔤 Từ đầu tiên: " + firstWordTitle + " - " + firstWordMeaning);

        assertFalse(firstWordTitle.isEmpty(), "❌ Thiếu từ đầu tiên");
        assertFalse(firstWordMeaning.isEmpty(), "❌ Thiếu nghĩa tiếng Việt trong từ đầu tiên");
    }

}
