/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package enums;

/**
 * 枚举实例
 *
 * @author zyy43688
 * @version $Id: EnumDemo.java, v 0.1 2018年2月23日 下午2:23:32 zyy43688 Exp $
 */

enum Color {
    RED, YELLOW, BLUE
}

public class EnumDemo {
    public static void main(String[] args) {
        Color[] colors = Color.values();
        for (Color color : colors) {
            System.out.println(color.ordinal() + " = " + color.name());
        }
    }
}