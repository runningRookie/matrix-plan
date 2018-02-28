/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.interfaces;

/**
 * @author zyy43688
 * @version $Id: MyMessage.java, v 0.1 2018年2月26日 下午2:05:24 zyy43688 Exp $
 */
public class MyMessage implements IMessage {
    @Override
    public void print() {
        System.out.println("实现print方法！");
    }
}