/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.extend;

/**
 * @author zyy43688
 * @version $Id: ExtendDemo.java, v 0.1 2018年2月26日 下午2:03:33 zyy43688 Exp $
 */
public class ExtendDemo {
    public static void main(String[] args) {
        System.out.println(Message.getCount());
        System.out.println(Message.count);

        System.out.println(SubMessage.count);
        System.out.println(SubMessage.getCount());

        System.out.println(new SubMessage().count);
        System.out.println(new SubMessage().getCount());
    }
}