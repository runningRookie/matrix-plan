/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package inherit;

import java.util.Date;

/**
 * @author zyy43688
 * @version $Id: ParentClass.java, v 0.1 2018年1月25日 上午10:59:39 zyy43688 Exp $
 */
public class ParentClass {
    public String      message = "简单的信息！";

    public static Date date;

    static {
        date = new Date();
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public static Date getDate() {
        return date;
    }

    public static void setDate(Date date) {
        ParentClass.date = date;
    }

    static class innerClass {
        public String tell = "it is me!";
    }
}