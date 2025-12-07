package tests;

import base.BasePage;
import base.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.Test;
import utils.ExcelUtils;

import java.time.Duration;

import static org.testng.AssertJUnit.*;

public class Profile extends BaseTest {
    BasePage base;
    WebDriverWait wait;

    private void openProfilePage1() throws Exception {
        base = new BasePage(driver);
        base.loginSuccess("Test1", "Test11!!");
        base.click(By.xpath("//span[normalize-space()='Tài khoản']"));
        Thread.sleep(2000);
    }

    private void openProfilePage2() throws Exception {
        base = new BasePage(driver);
        base.loginSuccess("nguyenlananh012004@gmail.com", "Test22!!");
        base.click(By.xpath("//span[normalize-space()='Tài khoản']"));
        Thread.sleep(2000);
    }

    private void openProfilePage3() throws Exception {
        base = new BasePage(driver);
        base.loginSuccess("Test3", "Test33!!");
        base.click(By.xpath("//span[normalize-space()='Tài khoản']"));
        Thread.sleep(2000);
    }

    public void logout() {
        base.click(By.xpath("//button[normalize-space()='Đăng xuất']"));

        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("div.fixed.inset-0.bg-black\\/30")));

        base.click(By.xpath("//div[contains(@class, 'fixed')]//button[contains(text(),'Đăng xuất')]"));
    }

    public void fillForm(String rowSheet, int rowIndex) throws Exception {
        ExcelUtils.loadExcel("src/test/java/data/TestData.xlsx", rowSheet);

        String fullName = ExcelUtils.getCellData(rowIndex, 1);
        String username = ExcelUtils.getCellData(rowIndex, 2);
        String currentPassword = ExcelUtils.getCellData(rowIndex, 3);
        String newPassword = ExcelUtils.getCellData(rowIndex, 4);

        if (!fullName.isEmpty()) {
            base.type(By.xpath("//label[normalize-space()='Họ và tên']/following-sibling::input"), fullName);
        }
        if (!username.isEmpty()) {
            base.type(By.xpath("//label[normalize-space()='Tên đăng nhập']/following-sibling::input"), username);
        }
        if (!currentPassword.isEmpty()) {
            base.type(By.xpath("//label[normalize-space()='Mật khẩu hiện tại']/following::input"), currentPassword);
        }
        if (!newPassword.isEmpty()) {
            base.type(By.xpath("//label[normalize-space()='Mật khẩu mới']/following::input"), newPassword);
        }
    }


    private void validateError(String expectedMessage) {
        WebElement errorMsg = base.waitForElementVisible(
                By.xpath("//*[contains(normalize-space(text()),'" + expectedMessage + "')]")
        );
        Assert.assertEquals(
                errorMsg.getText().trim(),
                expectedMessage,
                "Không hiển thị đúng thông báo lỗi: " + expectedMessage
        );
    }

    @Test
    public void TC03_showProfileInfoWhenClickProfile() throws Exception {
        openProfilePage1();

        // Chờ form hoặc modal hiển thị
        WebElement profileSection = base.waitForElementVisible(
                By.xpath("//h1[normalize-space()='Thông tin người dùng']")
        );
        assertTrue("❌ Không hiển thị tiêu đề 'Thông tin người dùng'!", profileSection.isDisplayed());

        Thread.sleep(2000);

        // Kiểm tra các thông tin cần có
        String[] fields = {
                "Họ và tên",
                "Tên đăng nhập",
        };

        for (String field : fields) {
            WebElement fieldLabel = base.waitForElementVisible(
                    By.xpath("//label[normalize-space()='" + field + "']")
            );

            WebElement fieldValue = base.waitForElementVisible(
                    By.xpath("//div[label[normalize-space()='" + field + "']]/input")
            );

            assertTrue(
                    "❌ Không tìm thấy hoặc không hiển thị giá trị cho trường '" + field + "'!",
                    fieldLabel.isDisplayed() && fieldValue.isDisplayed()
            );

            String value = fieldValue.getAttribute("value");
            assertNotNull("❌ Trường '" + field + "' bị trống!", value);
            assertFalse("❌ Trường '" + field + "' bị trống!", value.trim().isEmpty());
        }

        System.out.println("✅ Hiển thị đầy đủ thông tin người dùng khi click xem Profile!");
    }

    @Test
    public void TC04_passwordHidden() throws Exception {
        openProfilePage1();
        fillForm("ProfileTest", 1);

        // Danh sách label cần kiểm tra
        String[] labels = {"Mật khẩu hiện tại", "Mật khẩu mới"};

        for (String label : labels) {
            WebElement passwordInput = base.waitForElementVisible(
                    By.xpath("//label[normalize-space()='" + label + "']/following::input[1]")
            );

            String inputType = passwordInput.getAttribute("type");

            assertEquals(
                    "❌ Trường '" + label + "' KHÔNG được ẩn (type khác 'password')!",
                    "password",
                    inputType
            );
        }
    }

    @Test
    public void TC05_passwordVisibleWhenClickEye() throws Exception {
        openProfilePage1();
        fillForm("ProfileTest", 1);

        String[] labels = {"Mật khẩu hiện tại", "Mật khẩu mới"};

        for (String label : labels) {
            WebElement passwordInput = base.waitForElementVisible(
                    By.xpath("//label[normalize-space()='" + label + "']/following::input[1]")
            );

            base.click(By.xpath("//label[normalize-space()='" + label + "']/following::div/button/img[1]"));

            String inputType = passwordInput.getAttribute("type");

            assertEquals(
                    "❌ Trường '" + label + "' KHÔNG hiển thị khi click biểu tượng con mắt!",
                    "text",
                    inputType
            );
        }
    }

    @Test
    public void TC06_updateSuccess_allInfo() throws Exception {
        openProfilePage1();
        fillForm("ProfileTest", 2);

        base.click(By.xpath("//button[normalize-space(text())='Lưu thay đổi']"));

        WebElement successMsg = base.waitForElementVisible(
                By.xpath("//*[contains(text(),'Cập nhật thành công!')]")
        );
        assertTrue("❌ Không hiển thị thông báo 'Cập nhật thành công!' sau khi chỉnh sửa!",
                successMsg.isDisplayed());
    }

    @Test
    public void TC07_updateSuccess_onlyFullName() throws Exception {
        openProfilePage2();
        fillForm("ProfileTest", 3);

        base.click(By.xpath("//button[normalize-space(text())='Lưu thay đổi']"));

        WebElement successMsg = base.waitForElementVisible(
                By.xpath("//*[contains(text(),'Cập nhật thành công!')]")
        );
        assertTrue("❌ Không hiển thị thông báo 'Cập nhật thành công!' sau khi chỉnh sửa!",
                successMsg.isDisplayed());
    }

    @Test
    public void TC08_updateSuccess_onlyUsername() throws Exception {
        openProfilePage2();
        fillForm("ProfileTest", 4);

        base.click(By.xpath("//button[normalize-space(text())='Lưu thay đổi']"));

        WebElement successMsg = base.waitForElementVisible(
                By.xpath("//*[contains(text(),'Cập nhật thành công!')]")
        );
        assertTrue("❌ Không hiển thị thông báo 'Cập nhật thành công!' sau khi chỉnh sửa!",
                successMsg.isDisplayed());
    }

    @Test
    public void TC09_updateSuccess_onlyPassword() throws Exception {
        openProfilePage2();
        fillForm("ProfileTest", 5);

        base.click(By.xpath("//button[normalize-space(text())='Lưu thay đổi']"));

        WebElement successMsg = base.waitForElementVisible(
                By.xpath("//*[contains(text(),'Cập nhật thành công!')]")
        );
        assertTrue("❌ Không hiển thị thông báo 'Cập nhật thành công!' sau khi chỉnh sửa!",
                successMsg.isDisplayed());
    }

    @Test
    public void TC10_updateFail_emptyFullName() throws Exception {
        openProfilePage3();

        WebElement fullNameInput = base.waitForElementVisible(
                By.xpath("//label[normalize-space()='Họ và tên']/following-sibling::input")
        );
        fullNameInput.clear();

        WebElement saveButton = base.waitForElementVisible(
                By.xpath("//button[normalize-space(text())='Lưu thay đổi']")
        );

        boolean isDisabled = !saveButton.isEnabled();
        Assert.assertTrue(isDisabled, "Nút 'Lưu thay đổi' phải bị vô hiệu hóa khi họ tên trống");
    }

    @Test
    public void TC11_updateFail_emptyUsername() throws Exception {
        openProfilePage3();

        WebElement userameInput = base.waitForElementVisible(
                By.xpath("//label[normalize-space()='Tên đăng nhập']/following-sibling::input")
        );
        userameInput.clear();

        WebElement saveButton = base.waitForElementVisible(
                By.xpath("//button[normalize-space(text())='Lưu thay đổi']")
        );

        boolean isDisabled = !saveButton.isEnabled();
        Assert.assertTrue(isDisabled, "Nút 'Lưu thay đổi' phải bị vô hiệu hóa khi tên đăng nhập trống");
    }

    @Test
    public void TC12_updateFail_emptyAll() throws Exception {
        openProfilePage3();

        String[][] fields = {
                {"Họ và tên", "Họ và tên không được bỏ trống."},
                {"Tên đăng nhập", "Tên đăng nhập không được bỏ trống."}
        };

        for (String[] field : fields) {
            WebElement input = base.waitForElementVisible(
                    By.xpath("//label[normalize-space()='" + field[0] + "']/following-sibling::input")
            );
            input.clear();
            Thread.sleep(1000);
        }

        for (String[] field : fields) {
            WebElement saveButton = base.waitForElementVisible(
                    By.xpath("//button[normalize-space(text())='Lưu thay đổi']")
            );

            boolean isDisabled = !saveButton.isEnabled();
            Assert.assertTrue(isDisabled, "Nút 'Lưu thay đổi' phải bị vô hiệu hóa khi họ tên và tên đăng nhập trống");
        }
        logout();
    }

    @Test
    public void TC13_updateFail_samePassword() throws Exception {
        openProfilePage3();
        fillForm("ProfileTest", 6);

        base.click(By.xpath("//button[normalize-space(text())='Lưu thay đổi']"));

        validateError("Mật khẩu mới bị trùng mật khẩu hiện tại.");
    }

    @Test
    public void TC14_updateFail_wrongCurrentPassword() throws Exception {
        openProfilePage3();
        fillForm("ProfileTest", 7);

        base.click(By.xpath("//button[normalize-space(text())='Lưu thay đổi']"));

        validateError("Mật khẩu hiện tại không đúng.");
    }

    @Test
    public void TC15_updateFail_wrongNewPassword() throws Exception {
        openProfilePage3();
        fillForm("ProfileTest", 8);

        base.click(By.xpath("//button[normalize-space(text())='Lưu thay đổi']"));

        validateError("Mật khẩu mới phải từ 8 ký tự trở lên.");
    }

    @Test
    public void TC16_updateFail_sameUsername() throws Exception {
        openProfilePage3();
        fillForm("ProfileTest", 9);

        base.click(By.xpath("//button[normalize-space(text())='Lưu thay đổi']"));

        validateError("Tên đăng nhập đã tồn tại.");
    }

    @Test
    public void TC17_updateFail_emptyNewPassword() throws Exception{
        openProfilePage3();
        fillForm("ProfileTest", 10);

        base.click(By.xpath("//button[normalize-space(text())='Lưu thay đổi']"));

        validateError("Vui lòng nhập mật khẩu mới hoặc để trống mật khẩu hiện tại để thực hiện những thay đổi khác.");
    }

}
