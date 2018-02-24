/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package proxy;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

/**
 * @author zyy43688
 * @version $Id: MyInvocationHandler.java, v 0.1 2018年1月31日 下午3:20:45 zyy43688 Exp $
 */
public class MyInvocationHandler implements InvocationHandler {

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("invoke方法被调用了！");
        return null;
    }
}