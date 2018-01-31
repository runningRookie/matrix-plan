/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package dal;

import java.io.IOException;
import java.io.InputStream;

import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;

import com.google.gson.Gson;

import dal.object.Blog;

/**
 * @author zyy43688
 * @version $Id: MyBatisDemo.java, v 0.1 2018年1月24日 上午9:28:54 zyy43688 Exp $
 */
public class MyBatisDemo {
    public static void main(String[] args) throws IOException {
        String resource = "dal/MyBatisConfiguration.xml";
        InputStream inputStream = Resources.getResourceAsStream(resource);
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
        SqlSession sqlSession = sqlSessionFactory.openSession();
        Blog blog = sqlSession.selectOne("dal.example.BlogMapper.selectBlog", 1);
        System.out.println(new Gson().toJson(blog));
    }
}