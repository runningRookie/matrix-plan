/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package mybatis;

import java.io.IOException;
import java.io.InputStream;

import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;

import com.google.gson.Gson;

import mybatis.object.Blog;

/**
 * 从 XML 中构建 SqlSessionFactory
 *
 * @author zyy43688
 * @version $Id: BuildFromXmlDemo.java, v 0.1 2018年3月1日 下午4:55:25 zyy43688 Exp $
 */
public class BuildFromXmlDemo {
    public static void main(String[] args) throws IOException {
        // 配置文件载入
        String resource = "mybatis/MyBatisConfiguration.xml";
        InputStream inputStream = Resources.getResourceAsStream(resource);

        // 构建session工厂
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);

        // 打开会话
        SqlSession sqlSession = sqlSessionFactory.openSession();

        // 执行SQL语句
        Blog blog = sqlSession.selectOne("mybatis.example.BlogMapper.selectBlog", 1);

        // 输出结果
        System.out.println(new Gson().toJson(blog));
    }
}