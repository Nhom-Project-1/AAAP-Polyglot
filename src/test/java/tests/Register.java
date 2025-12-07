package tests;

import base.BasePage;
import base.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.Test;
import utils.ExcelUtils;
import utils.GmailUtils;

import java.time.Duration;
import java.util.Date;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class Register extends BaseTest {
    BasePage base;
    String wrongCode = "123456";

    private void fillRegisterForm(String rowSheet, int rowIndex) throws Exception {
        ExcelUtils.loadExcel("src/test/java/data/TestData.xlsx", rowSheet);

        String fullName = ExcelUtils.getCellData(rowIndex, 1);
        String username = ExcelUtils.getCellData(rowIndex, 2);
        String email = ExcelUtils.getCellData(rowIndex, 3);
        String password = ExcelUtils.getCellData(rowIndex, 4);

        // Khởi tạo base khi đã có driver
        base = new BasePage(driver);

        // Click nút "Đăng ký" trên trang chủ
        base.click(By.xpath("//button[normalize-space()='Đăng ký']"));

        // Điền form
        base.type(By.xpath("//label[normalize-space()='Họ và tên']/following-sibling::input"), fullName);
        base.type(By.xpath("//label[normalize-space()='Tên đăng nhập']/following-sibling::input"), username);
        base.type(By.xpath("//label[normalize-space()='Email']/following-sibling::input"), email);
        base.type(By.xpath("//label[normalize-space()='Mật khẩu']/following::input"), password);
    }

    private void submitRegisterForm() {
        base.click(By.xpath("//button[normalize-space()='Đăng ký']"));
    }

    private void enterVerificationCode(String code) {
        // Wait input xuất hiện trước khi điền
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//label[normalize-space()='Mã xác thực']/following-sibling::input")
        ));

        System.out.println("Điền OTP vào input: " + code);
        input.clear();
        input.sendKeys(code);
    }

    private void validateError(String expectedMessage) {
        WebElement errorMsg = base.waitForElementVisible(
                By.xpath("//*[@role='status']")
        );

        assertEquals(errorMsg.getText(), expectedMessage,
                "Không hiển thị đúng thông báo lỗi: " + expectedMessage);
    }

    @Test
    public void TC05_registerFail_wrongOTP() throws Exception {
        fillRegisterForm("RegisterTest", 1);
        submitRegisterForm();
        By otpSentMsg = By.xpath("//*[contains(text(),'Mã xác thực đã được gửi tới email của bạn!')]");
        base.waitForElementVisible(otpSentMsg);
        base.waitForElementInvisible(otpSentMsg);
        enterVerificationCode(wrongCode);
        submitRegisterForm();
        validateError("Mã xác thực không đúng.");
    }

    @Test
    public void TC06_registerSuccess() throws Exception {
        fillRegisterForm("RegisterTest", 1);
        Date startTime = new Date((System.currentTimeMillis() - 2 * 60 * 1000));
        submitRegisterForm();

        String email = "quangcadoikhongchet@gmail.com";
        String appPassword = "yzmdsorajmdvkvco";

        // Lấy OTP từ Gmail (retry 30s)
//        String verificationCode = GmailUtils.getVerificationCode(email, appPassword);
        Thread.sleep(10_000);
        String verificationCode = GmailUtils.getVerificationCode(email, appPassword, startTime);

        // Điền OTP
        enterVerificationCode(verificationCode);
        submitRegisterForm();

        WebElement learningTitle = base.waitForElementVisible(
                By.xpath("//h1[normalize-space()='Chọn một ngôn ngữ bạn muốn học']")
        );
        assertTrue(learningTitle.isDisplayed(),
                "Trang học tập không hiển thị tiêu đề 'Chọn một ngôn ngữ bạn muốn học'!");
    }

    @Test
    public void TC07_registerFail_missingFullName() throws Exception {
        fillRegisterForm("RegisterTest", 2);
        submitRegisterForm();
        validateError("Vui lòng nhập đầy đủ thông tin.");
    }

    @Test
    public void TC08_registerFail_missingUsername() throws Exception {
        fillRegisterForm("RegisterTest", 3);
        submitRegisterForm();
        validateError("Vui lòng nhập đầy đủ thông tin.");

    }

    @Test
    public void TC09_registerFail_missingEmail() throws Exception {
        fillRegisterForm("RegisterTest", 4);
        submitRegisterForm();
        validateError("Vui lòng nhập đầy đủ thông tin.");
    }

    @Test
    public void TC10_registerFail_missingPassword() throws Exception {
        fillRegisterForm("RegisterTest", 5);
        submitRegisterForm();
        validateError( "Vui lòng nhập đầy đủ thông tin.");
    }

//    @Test
//    public void TC7_registerFail_missingConfirm() throws Exception {
//        fillRegisterForm("RegisterTest", 6);
//        submitRegisterForm();
//        validateError( "Vui lòng nhập lại mật khẩu!");
//    }

    @Test
    public void TC11_registerFail_invalidEmailFormat() throws Exception {
        fillRegisterForm("RegisterTest", 6);
        submitRegisterForm();
        validateError("Email phải có đuôi @gmail.com");
    }

    @Test
    public void TC12_registerFail_existingEmail() throws Exception {
        fillRegisterForm("RegisterTest", 7);
        submitRegisterForm();
        validateError( "Email hoặc tên đăng nhập đã tồn tại.");
    }

    @Test
    public void TC13_registerFail_existingUsername() throws Exception {
        fillRegisterForm("RegisterTest", 8);
        submitRegisterForm();
        validateError( "Email hoặc tên đăng nhập đã tồn tại.");
    }
}
