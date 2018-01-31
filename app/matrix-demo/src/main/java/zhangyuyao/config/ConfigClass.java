/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import zhangyuyao.Foo;

/**
 * @author zyy43688
 * @version $Id: ConfigClass.java, v 0.1 2018年1月4日 下午5:04:54 zyy43688 Exp $
 */
@Configuration
public class ConfigClass {
    @Bean
    public Foo foo() {
        return new Foo();
    }
}