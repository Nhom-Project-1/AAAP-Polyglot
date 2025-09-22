package example;

import io.qase.api.annotation.QaseId;
import io.qase.api.annotation.Step;
import org.junit.jupiter.api.Test;
import org.testng.Assert;

public class MyFirstTest {
    @Test
    @QaseId(1)
    public void loginTest(){
        logStep("Mở trang đăng nhập");
        logStep("Nhập username & password");
        logStep("Bấm nút Đăng nhập");
        Assert.assertTrue(1 + 1 == 2, "Check phép tính 1+1=2");
    }
    @Step("Thực hiện step: {0}")
    public void logStep(String step) {
        // Qase ghi nhận step này
    }
}
