/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package inherit;

/**
 * @author zyy43688
 * @version $Id: Main.java, v 0.1 2018年1月25日 上午11:01:23 zyy43688 Exp $
 */
public class Main {
    public static void main(String[] args) {
        System.out.println(SubClass.date);
        System.out.println(new ParentClass.innerClass().tell);
        System.out.println(new SubClass().message);

    }
}