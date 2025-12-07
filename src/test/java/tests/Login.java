package tests;

import base.BasePage;
import base.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;
import utils.ExcelUtils;

import static org.testng.Assert.assertTrue;
import static org.testng.AssertJUnit.assertEquals;

public class Login extends BaseTest {
    BasePage base;

    private void fillForm(String rowSheet, int rowIndex) throws Exception {
        ExcelUtils.loadExcel("src/test/java/data/TestData.xlsx", rowSheet);

        String identifier = ExcelUtils.getCellData(rowIndex, 1);
        String password = ExcelUtils.getCellData(rowIndex, 2);

        base = new BasePage(driver);

        base.click(By.xpath("//button[normalize-space()='Đăng nhập']"));

        base.type(By.xpath("//label[normalize-space()='Tên đăng nhập hoặc email']/following-sibling::input"), identifier);
        base.type(By.xpath("//label[normalize-space()='Mật khẩu']/following::input"), password);
    }

    private void submitForm() {
        base.click(By.xpath("//button[normalize-space()='Đăng nhập']"));
    }

    private void validateError(String expectedMessage) {
        WebElement errorMsg = base.waitForElementVisible(
                By.xpath("//p[contains(@class,'text-red-500') and contains(@class,'text-xs')]")
        );
        Assert.assertEquals(errorMsg.getText(), expectedMessage,
                "Không hiển thị đúng thông báo lỗi: " + expectedMessage);
    }

    @Test
    public void TC03_loginPasswordHidden() throws Exception {
        // Điền dữ liệu từ Excel
        fillForm("LoginTest", 1);

        // Tìm ô nhập mật khẩu
        WebElement passwordInput = base.waitForElementVisible(
                By.xpath("//label[normalize-space()='Mật khẩu']/following::input")
        );

        // Lấy giá trị thuộc tính "type"
        String inputType = passwordInput.getAttribute("type");

        // Assert kiểm tra type = password
        assertEquals( "❌ Trường mật khẩu KHÔNG được ẩn (type khác 'password')!", "password", inputType);
    }

    @Test
    public void TC04_loginPasswordVisibleWhenClickEye() throws Exception {
        fillForm("LoginTest", 1);
        WebElement passwordInput = base.waitForElementVisible(
                By.xpath("//label[normalize-space()='Mật khẩu']/following::input")
        );
        base.click(By.xpath("//label[normalize-space()='Mật khẩu']/following::div/button/img"));
        String inputTypeAfter = passwordInput.getAttribute("type");
        assertEquals("Mật khẩu không hiển thị sau khi click biểu tượng con mắt!", "text", inputTypeAfter);
    }

    @Test
    public void TC05_loginSuccesswEmail() throws Exception {
        fillForm("LoginTest", 2);
        submitForm();
        WebElement hocTapElement = base.waitForElementVisible(
                By.xpath("//span[normalize-space()='Học tập' and contains(@class, 'text-2xl')]")
        );
        // ✅ Kiểm tra phần tử hiển thị
        assertTrue(hocTapElement.isDisplayed(), "❌ Không hiển thị mục 'Học tập' sau khi đăng nhập!");

        // ✅ Kiểm tra text đúng là 'Học tập'
        assertEquals("❌ Nội dung hiển thị không phải 'Học tập'!", "Học tập", hocTapElement.getText().trim());
    }

    @Test
    public void TC06_loginSuccesswUsername() throws Exception {
        fillForm("LoginTest", 3);
        submitForm();
        WebElement hocTapElement = base.waitForElementVisible(
                By.xpath("//span[normalize-space()='Học tập' and contains(@class, 'text-2xl')]")
        );
        // ✅ Kiểm tra phần tử hiển thị
        assertTrue(hocTapElement.isDisplayed(), "❌ Không hiển thị mục 'Học tập' sau khi đăng nhập!");

        // ✅ Kiểm tra text đúng là 'Học tập'
        assertEquals("❌ Nội dung hiển thị không phải 'Học tập'!", "Học tập", hocTapElement.getText().trim());
    }

    @Test
    public void TC07_loginFail_wrongIdentifier() throws Exception {
        fillForm("LoginTest", 4);
        submitForm();
        validateError("Tên đăng nhập hoặc email không tồn tại.");
    }

    @Test
    public void TC08_loginFail_wrongIdentifierandPassword() throws Exception {
        fillForm("LoginTest", 5);
        submitForm();
        validateError("Tên đăng nhập hoặc email không tồn tại.");
    }

    @Test
    public void TC09_loginFail_wrongPassword() throws Exception {
        fillForm("LoginTest", 6);
        submitForm();
        validateError("Thông tin đăng nhập không chính xác.");
    }

    @Test
    public void TC10_loginFail_missingIdentifier() throws Exception {
        fillForm("LoginTest", 7);
        submitForm();
        validateError("Vui lòng nhập đầy đủ thông tin.");
    }

    @Test
    public void TC11_loginFail_missingPassword() throws Exception {
        fillForm("LoginTest", 8);
        submitForm();
        validateError("Vui lòng nhập đầy đủ thông tin.");
    }

    @Test
    public void TC12_loginFail_missingIdentifierandPassword() throws Exception {
        fillForm("LoginTest", 9);
        submitForm();
        validateError("Vui lòng nhập đầy đủ thông tin.");
    }

}
