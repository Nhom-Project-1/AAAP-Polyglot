package utils;

import java.util.Date;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.mail.*;
import javax.mail.search.FlagTerm;

public class GmailUtils {

    public static String getVerificationCode(String email, String appPassword, Date startTime) throws Exception {
        Properties props = new Properties();
        props.put("mail.store.protocol", "imaps");
        Session session = Session.getDefaultInstance(props, null);
        Store store = session.getStore("imaps");
        store.connect("imap.gmail.com", email, appPassword);

        Folder inbox = store.getFolder("INBOX");
        inbox.open(Folder.READ_WRITE);

        long startMillis = System.currentTimeMillis(); // dùng để tính timeout
        long timeout = 120000; // 2 phút
        long sleepMillis = 3000;

        Pattern otpPattern = Pattern.compile("(\\d{6})");
        String code = null;

        while (System.currentTimeMillis() - startMillis < timeout) {
            System.out.println("⏳ Đang kiểm tra email mới...");
            inbox.close(false);
            inbox.open(Folder.READ_WRITE);
            inbox.getMessageCount();
            Message[] messages = inbox.getMessages();

            // Duyệt ngược từ email mới nhất
            for (int i = messages.length - 1; i >= 0; i--) {
                Message msg = messages[i];
                Address[] froms = msg.getFrom();
                String sender = (froms != null && froms.length > 0) ? froms[0].toString() : "";

                // 📩 Kiểm tra người gửi
                if (sender.toLowerCase().contains("aaap polyglot")) {
                    Date receivedDate = msg.getReceivedDate();
                    System.out.println("📨 Email từ " + sender + " lúc " + receivedDate);

                    // ⚠️ Bỏ qua mail cũ hơn thời điểm bắt đầu test
                    if (receivedDate.before(startTime)) {
                        System.out.println("➡️ Bỏ qua email cũ trước thời điểm test.");
                        continue;
                    }

                    // 📬 Đọc nội dung email
                    Object contentObj = msg.getContent();
                    StringBuilder content = new StringBuilder();

                    if (contentObj instanceof Multipart) {
                        Multipart mp = (Multipart) contentObj;
                        for (int j = 0; j < mp.getCount(); j++) {
                            content.append(mp.getBodyPart(j).getContent().toString());
                        }
                    } else {
                        content.append(contentObj.toString());
                    }

                    Matcher m = otpPattern.matcher(content);
                    if (m.find()) {
                        code = m.group(1);
                        msg.setFlag(Flags.Flag.SEEN, true);
                        inbox.close(false);
                        store.close();
                        System.out.println("✅ OTP mới nhận được: " + code);
                        return code;
                    } else {
                        System.out.println("⚠️ Không tìm thấy mã OTP trong nội dung email!");
                    }
                }
            }

            Thread.sleep(sleepMillis);
        }

        inbox.close(false);
        store.close();
        throw new Exception("❌ Không tìm thấy mã OTP trong Gmail sau 2 phút!");
    }
}

