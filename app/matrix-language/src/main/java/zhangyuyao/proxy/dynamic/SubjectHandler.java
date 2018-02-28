/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.proxy.dynamic;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.util.Arrays;

/**
 * 自定义调用处理器
 *
 * @author zyy43688
 * @version $Id: SubjectHandler.java, v 0.1 2018年2月26日 上午11:00:48 zyy43688 Exp $
 */
public class SubjectHandler implements InvocationHandler {
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println(method.getName());
        System.out.println(Arrays.toString(args));
        System.out.println("自定义调用处理器！");
        return new Object();
    }
}