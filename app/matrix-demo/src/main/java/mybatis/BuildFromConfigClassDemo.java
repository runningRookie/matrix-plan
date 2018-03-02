/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package mybatis;

import org.apache.ibatis.datasource.pooled.PooledDataSource;
import org.apache.ibatis.mapping.Environment;
import org.apache.ibatis.session.Configuration;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.apache.ibatis.transaction.TransactionFactory;
import org.apache.ibatis.transaction.jdbc.JdbcTransactionFactory;

import com.google.gson.Gson;

import mybatis.mapper.BlogMapper;
import mybatis.object.Blog;

/**
 * 通过java类配置MyBatis
 *
 * @author zyy43688
 * @version $Id: BuildFromConfigClassDemo.java, v 0.1 2018年3月1日 下午5:27:16 zyy43688 Exp $
 */
public class BuildFromConfigClassDemo {

    /**
     * 
     * @param args
     */
    public static void main(String[] args) {
        // mybatis默认实现的两个数据源
        // 一个是池化的
        // 一个是非池化的
        PooledDataSource pooledDataSource = new PooledDataSource();
        pooledDataSource.setDriver("com.mysql.cj.jdbc.Driver");
        pooledDataSource.setUrl("jdbc:mysql://localhost:3306/mybatis?serverTimezone=UTC&useUnicode=true&characterEncoding=utf-8&useSSL=false");
        pooledDataSource.setUsername("root");
        pooledDataSource.setPassword("225821zyy");

        // 事物管理
        TransactionFactory transactionFactory = new JdbcTransactionFactory();

        // 运行时环境
        Environment environment = new Environment("development", transactionFactory, pooledDataSource);

        // 配置类
        Configuration configuration = new Configuration(environment);

        // 加载转换器文件
        configuration.addMapper(BlogMapper.class);

        // 从配置文件中构建SQLSession工厂
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(configuration);

        // 打开一个session
        SqlSession session = sqlSessionFactory.openSession();

        try {
            // 通过类完全限定名加方法名的方式进行访问
            Blog blog = session.selectOne("mybatis.mapper.BlogMapper.getBlogById", 1);
            System.out.println(new Gson().toJson(blog));

            // 通过转换器类进行访问
            BlogMapper blogMapper = session.getMapper(BlogMapper.class);
            blog = blogMapper.getBlogById(1);
            System.out.println(new Gson().toJson(blog));
        } finally {

            // 释放资源
            session.close();
        }
    }
}