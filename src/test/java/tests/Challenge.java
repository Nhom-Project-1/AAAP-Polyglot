package tests;

import base.BasePage;
import base.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.Test;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import static org.testng.Assert.assertNotEquals;
import static org.testng.Assert.assertTrue;
import static org.testng.AssertJUnit.assertEquals;

public class Challenge extends BaseTest {
    BasePage base;

    private void login() throws Exception {
        base = new BasePage(driver);
        base.loginSuccess("Test3", "Test33!!");
    }

    private void openChallengePage() throws Exception{
        base.click(By.xpath("(//div[contains(@class, 'relative flex flex-col items-center')])[1]//div[contains(@class, 'bg-pink-400')]"));
        Thread.sleep(2500);
        ((JavascriptExecutor) driver).executeScript("window.scrollTo(0, document.body.scrollHeight)");
        base.click(By.xpath("//button[normalize-space()='Bắt đầu làm bài']"));
        Thread.sleep(4000);
    }

    private int getHeartCount() {
        WebElement heart = base.waitForElementVisible(By.cssSelector("header .text-pink-600"));
        return Integer.parseInt(heart.getText().trim());
    }

    private void clickAnswer(String answerText) {
        WebElement answer = base.waitForElementClickable(By.xpath("//button[text()='"+ answerText + "']"));
        answer.click();
    }

    private void clickCheck() {
        WebElement check = base.waitForElementClickable(By.xpath("//footer//button[contains(text(),'Kiểm tra')]"));
        check.click();
    }

    @Test
    public void TC04_VerifyStartChallengeUI() throws Exception {
        login();
        openChallengePage();

        // 1. Kiểm tra thanh tiến độ
        By containerLocator = By.cssSelector("header div.bg-gray-200");
        WebElement container = base.waitForElementVisible(containerLocator);
        WebElement progressBar = container.findElement(By.cssSelector("div.bg-pink-500"));
        String widthStyle = progressBar.getAttribute("style");
        assertTrue(widthStyle.contains("0"), "❌ Thanh tiến độ không hiển thị 0% ban đầu");

        // 2. Kiểm tra số tim sẵn
        assertEquals("❌ Số tim hiển thị không đúng", 5, getHeartCount());

        // 3. Kiểm tra câu hỏi đầu tiên
        WebElement question = base.waitForElementVisible(By.tagName("main")).findElement(By.tagName("p"));
        String questionText = question.getText().trim();
        String expectedQuestionFromDB = "Đồ vật nào đánh thức bạn mỗi sáng?"; // Lấy từ DB
        assertEquals("❌ Câu hỏi đầu tiên không đúng", expectedQuestionFromDB, questionText);

        // 4. Kiểm tra nội dung 4 lựa chọn
        WebElement choicesContainer = base.waitForElementVisible(By.cssSelector("main div.flex.flex-col.gap-3"));
        List<WebElement> choices = choicesContainer.findElements(By.tagName("button"));
        String[] expectedChoices = {"Routine", "Appointment", "Alarm", "Cereal"};
        for (int i = 0; i < 4; i++) {
            String actualChoice = choices.get(i).getText().trim();
            assertEquals("❌ Lựa chọn thứ " + (i+1) + " không đúng", expectedChoices[i], actualChoice);
        }

        System.out.println("✅ Giao diện bắt đầu challenge hiển thị đúng: tiến độ 0%, 5 tim, nội dung câu hỏi và lựa chọn.");
    }

    @Test
    public void TC05_selectAnswer() throws Exception{
        login();
        openChallengePage();

        WebElement firstAnswer = base.waitForElementClickable(By.cssSelector("main button.bg-gray-100"));
        firstAnswer.click();
        Thread.sleep(500);

        String buttonClass = firstAnswer.getAttribute("class");
        assertTrue(buttonClass.contains("bg-pink-100") && buttonClass.contains("border-pink-500") && buttonClass.contains("text-pink-700"),
                "❌ Đáp án chưa được highlight màu hồng.");

        System.out.println("✅ Đáp án được highlight sau khi chọn.");
    }

    @Test
    public void TC06_checkSubmitButtonDisabledBeforeSelectingAnswer() throws Exception{
        login();
        openChallengePage();

        WebElement checkButton = base.waitForElementVisible(By.xpath("//footer//button[contains(text(),'Kiểm tra')]"));

        assertTrue(!checkButton.isEnabled(), "❌ Nút 'Kiểm tra' chưa bị disable khi chưa chọn đáp án.");
        System.out.println("✅ Nút 'Kiểm tra' bị disable khi chưa chọn đáp án.");
    }

    @Test
    public void TC07_verifyCorrectAnswer() throws Exception{
        login();
        openChallengePage();

        int heartsBefore = getHeartCount();
        System.out.println("Tim trước khi trả lời: " + heartsBefore);

        clickAnswer("Alarm");

        clickCheck();

        WebElement answerHighlighted = base.waitForElementVisible(By.cssSelector("button.bg-green-400.text-white.border-green-500"));
        assertTrue(answerHighlighted.isDisplayed(), "❌ Đáp án đúng chưa được highlight màu xanh.");

        WebElement message = base.waitForElementVisible(By.cssSelector("p.text-green-700"));
        assertEquals("❌ Nội dung thông báo đúng chưa chính xác.", "Chính xác! Tiếp tục phát huy câu sau nha.\uD83E\uDD73\uD83E\uDD73\uD83E\uDD73", message.getText().trim());

        assertEquals("❌ Tim bị trừ sau khi chọn đáp án đúng.", heartsBefore, getHeartCount());

        System.out.println("✅ Chọn đáp án đúng: đổi màu xanh, thông báo đúng, tim giữ nguyên.");
    }

    @Test
    public void TC08_verifyIncorrectAnswer() throws Exception{
        login();
        openChallengePage();

        int heartsBefore = getHeartCount();
        System.out.println("Tim trước khi trả lời: " + heartsBefore);

        clickAnswer("Routine");

        clickCheck();
        Thread.sleep(1000);

        WebElement wrongHighlighted = base.waitForElementVisible(By.cssSelector("button.bg-red-400.text-white.border-red-500"));
        assertTrue(wrongHighlighted.isDisplayed(), "❌ Đáp án sai chưa được highlight màu đỏ.");

        WebElement correctHighlighted = base.waitForElementVisible(By.cssSelector("button.bg-green-300.text-white.border-green-400"));
        assertTrue(correctHighlighted.isDisplayed(), "❌ Đáp án đúng chưa được highlight màu xanh.");

        WebElement message = base.waitForElementVisible(By.cssSelector("p.text-red-700"));
        assertEquals("❌ Nội dung thông báo sai chưa chính xác.", "Sai mất rồi! Bạn bị -1 tim.\uD83E\uDD7A\uD83E\uDD7A\uD83E\uDD7A", message.getText().trim());

        System.out.println("Tim sau khi trả lời: " + getHeartCount());
        assertEquals("❌ Tim không bị trừ sau khi chọn đáp án sai.", heartsBefore - 1, getHeartCount());

        System.out.println("✅ Chọn đáp án sai: đỏ cho sai, xanh cho đúng, thông báo sai, tim giảm 1.");
    }

    @Test
    public void TC09_VerifyCheckAndNextButton() throws Exception {
        login();
        openChallengePage();

        WebElement correctAnswer = base.waitForElementClickable(By.xpath("//button[text()='Alarm']"));
        correctAnswer.click();

        WebElement checkButton = base.waitForElementClickable(By.xpath("//footer//button[contains(text(),'Kiểm tra')]"));
        checkButton.click();

        WebElement nextButton = base.waitForElementVisible(By.xpath("//footer//button[contains(text(),'Tiếp tục')]"));
        assertTrue(nextButton.isDisplayed(), "❌ Nút 'Tiếp theo' chưa hiển thị sau khi kiểm tra.");
        System.out.println("✅ Sau khi ấn 'Kiểm tra', nút đổi thành 'Tiếp theo'.");

        WebElement currentQuestion = base.waitForElementVisible(By.cssSelector("main p"));
        String oldQuestion = currentQuestion.getText().trim();

        nextButton.click();
        Thread.sleep(2000);

        WebElement newQuestion = base.waitForElementVisible(By.cssSelector("main p"));
        String newQuestionText = newQuestion.getText().trim();
        assertNotEquals(newQuestionText, oldQuestion, "❌ Câu hỏi không đổi sau khi ấn 'Tiếp theo'.");
        System.out.println("✅ Hệ thống chuyển sang câu hỏi tiếp theo thành công.");

        List<WebElement> answers = base.waitForElementsVisible(
                By.cssSelector("div.flex.flex-col.gap-3.w-full.max-w-md > button")
        );
        boolean allReset = answers.stream().allMatch(a -> a.isDisplayed() && a.isEnabled());
        assertTrue(allReset, "❌ Các đáp án chưa được reset sau khi chuyển câu hỏi.");
        System.out.println("✅ Đáp án được reset về trạng thái ban đầu.");

        WebElement checkButtonAgain = base.waitForElementVisible(By.xpath("//footer//button[contains(text(),'Kiểm tra')]"));
        assertTrue(checkButtonAgain.isDisplayed(), "❌ Nút 'Kiểm tra' chưa hiển thị trở lại.");
        System.out.println("✅ Nút 'Tiếp theo' đổi lại thành 'Kiểm tra' sau khi sang câu mới.");
    }

    @Test
    public void TC011_Challenge_Failure() throws Exception {
        login();
        openChallengePage();

        List<String> wrongAnswers = List.of(
                "Routine",
                "Schedule",
                "Stir",
                "Dinner",
                "Alarm"
        );

        for (String wrongAnswer : wrongAnswers) {
            clickAnswer(wrongAnswer);
            clickCheck();
            Thread.sleep(1000);

            int hearts = getHeartCount();
            if (hearts <= 0) {
                System.out.println("Hết tim");
                break;
            }
            try {
                WebElement nextButton = base.waitForElementClickable(By.xpath("//footer//button[contains(text(),'Tiếp tục')]"));
                nextButton.click();
                Thread.sleep(1000);
            } catch (Exception e) {
                System.out.println("Không có nút 'Tiếp tục', có thể đã hết tim.");
                break;
            }
        }

        WebElement failMessage = base.waitForElementVisible(By.xpath("//h2[contains(text(),'Hết tim')]"));
        assertTrue(failMessage.isDisplayed(), "❌ Thông báo 'Hết tim' chưa hiển thị");

        WebElement retryButton = base.waitForElementVisible(By.xpath("//button[contains(text(),'Làm lại')]"));
        WebElement exitButton = base.waitForElementVisible(By.xpath("//button[contains(text(),'Thoát')]"));
        assertTrue(retryButton.isDisplayed(), "❌ Nút 'Làm lại' chưa hiển thị");
        assertTrue(exitButton.isDisplayed(), "❌ Nút 'Thoát' chưa hiển thị");

        System.out.println("✅ Challenge thất bại: hết tim, thông báo hiển thị, nút 'Làm lại'/'Thoát' xuất hiện.");
    }

    @Test
    public void TC012_Challenge_Success() throws Exception {
        login();
        openChallengePage();

        List<String> trueAnswers = List.of(
                "Grandmother",
                "Nephew",
                "Cô, dì",
                "Uncle",
                "Stepfather",
                "Mother-in-law"
        );

        for (String trueAnswer : trueAnswers) {
            clickAnswer(trueAnswer);
            clickCheck();
            Thread.sleep(500);

            WebElement nextButton = base.waitForElementClickable(By.xpath("//footer//button[contains(text(),'Tiếp tục')]"));
            nextButton.click();
            Thread.sleep(500);
        }
        WebElement successTitle = base.waitForElementVisible(By.xpath("//h1[contains(text(),'Hoàn thành')]"));
        assertTrue(successTitle.isDisplayed(), "❌ Tiêu đề 'Hoàn thành' chưa hiển thị");

        WebElement messageElement = base.waitForElementVisible(By.cssSelector("div.z-10 > p"));
        assertTrue(messageElement.isDisplayed(), "❌ Nội dung thông báo hoàn thành chưa hiển thị");

        WebElement retryButton = base.waitForElementVisible(By.xpath("//button[contains(text(),'Làm lại thử thách')]"));
        WebElement continueButton = base.waitForElementVisible(By.xpath("//button[contains(text(),'Tiếp tục học')]"));
        assertTrue(retryButton.isDisplayed(), "❌ Nút 'Làm lại thử thách' chưa hiển thị");
        assertTrue(continueButton.isDisplayed(), "❌ Nút 'Tiếp tục học' chưa hiển thị");

        System.out.println("✅ Challenge hoàn thành: tiêu đề, thông báo và nút 'Làm lại thử thách'/'Tiếp tục học' hiển thị đúng.");
    }

//    @Test
//    public void TC013_Challenge_Fail_On_Last_Heart() throws Exception {
//        login();
//        openChallengePage();
//
//        List<String> answersUntilLast = List.of(
//                "Mother",      // Sai -> mất 1 tim
//                "Niece",       // Sai -> mất 1 tim
//                "Grandmother", // Đúng
//                "Nephew",      // Đúng
//                "Aunt"         // Đúng
//        );
//
//        for (String ans : answersUntilLast) {
//            clickAnswer(ans);
//            clickCheck();
//            Thread.sleep(300);
//
//            int hearts = getHeartCount();
//            if (hearts == 1) {
//                System.out.println("Còn 1 tim, chuẩn bị làm câu cuối cùng.");
//                break;
//            }
//
//            WebElement nextButton = base.waitForElementClickable(
//                    By.xpath("//footer//button[contains(text(),'Tiếp tục')]")
//            );
//            nextButton.click();
//            Thread.sleep(300);
//        }
//
//        clickAnswer("Mother");
//        clickCheck();
//        Thread.sleep(400);
//
//        // 1️⃣ Kiểm tra hiển thị đáp án sai (màu đỏ)
//        WebElement wrongOption = base.waitForElementVisible(
//                By.xpath("//button[contains(@class,'bg-red') or contains(@class,'border-red')]")
//        );
//        assertTrue(wrongOption.isDisplayed(), "❌ Đáp án sai không chuyển sang màu đỏ");
//
//        // 2️⃣ Kiểm tra hiển thị đáp án đúng (màu xanh)
//        WebElement correctOption = base.waitForElementVisible(
//                By.xpath("//button[contains(@class,'bg-green') or contains(@class,'border-green')]")
//        );
//        assertTrue(correctOption.isDisplayed(), "❌ Đáp án đúng không chuyển sang màu xanh");
//
//        // 3️⃣ Kiểm tra Challenge kết thúc vì hết tim
//        WebElement failTitle = base.waitForElementVisible(
//                By.xpath("//h2[contains(text(),'Hết tim') or contains(text(),'Thử thách kết thúc')]")
//        );
//        assertTrue(failTitle.isDisplayed(), "❌ Không hiển thị 'Hết tim' hoặc 'Thử thách kết thúc'");
//
//        // 4️⃣ Kiểm tra không cộng XP → không xuất hiện màn hình Hoàn thành
//        List<WebElement> successTitle = base.waitForElementVisible(
//                By.xpath("//h1[contains(text(),'Hoàn thành')]")
//        );
//        assertTrue(successTitle.isEmpty(), "❌ Không được phép ghi nhận điểm (màn hình hoàn thành xuất hiện)");
//
//        System.out.println("✅ TC013 Passed – Sai câu cuối cùng khi còn 1 tim → hiển thị đúng UI thất bại, không cộng XP.");
//    }

}
