/* eslint-disable react/no-unescaped-entities */
import '../css/Home.css';
import React from 'react';
import { Helmet } from 'react-helmet';

const Home = () => {
  return (
    <div className="home">

      <Helmet>
        <title>About me</title>
        <meta
          name="description"
          content="Page where I upload clips n stuff"
        />
      </Helmet>

      <section className='card shadow'>
        <h3> Hi! </h3>

        <p>
          I'm Navy, or Erik. I'm a 20-something year old software developer from Finland.
          I don't really do design™, so excuse the oddly themed page (it's also probably unfinished).
        </p>

        <p>
          I like to volunteer some of my free time in online communities both as a moderator as well as a bot developer and maintainer.
          My longest running project is a Discord bot named <a href='https://galactic.corgi.wtf'>Galactic</a> that I was invited to join in 2016 and have been maintaining and developing since.
          A bunch of my projects are available on my Github, though some of them are also in private repositories for various reasons.
        </p>

        <p>
          On top of software development I enjoy playing vidya, of which I may occasionally post clips in the media page on this site.
          Beyond that there isn't much else to know about me, am simple man.
        </p>

        <p>
          <small><small><strong>P.S.</strong> corgis r amazing</small></small>
        </p>
      </section>

      <section className='card shadow'>

        <h3>Languages, environments, tools etc I can work with</h3>

        <p>
          I can work with various ...things™ <br />
          I'm most proficient with JS within the Node environment as it's the one I've worked with the longest,
          though I can work well within any JS environment now. When working on Node projects I most commonly use MongoDB and MariaDB if needed. Web apis I write using Express.
        </p>

        <p>
          I try to containerise most of my latest projects with docker. Metrics I do with Prometheus if suitable.
        </p>

        <p>
          I've also dabbled in writing the occasional C# and Java project,
          I can hold my own when using these languages but would not consider myself proficient with them.
        </p>

        <br/>
        <small>I probably forgot something, so chances are this probably isn't everything.</small>

      </section>
      
      <section className='card shadow'>
        <h3> While you're here... </h3>
        <p>
          Check out these <br />
          <a href='https://youtu.be/CoFjbnvkmQ0'>https://youtu.be/CoFjbnvkmQ0</a> <br />
          <a href='https://youtu.be/HnZSaKYmP2s'>https://youtu.be/HnZSaKYmP2s</a> <br />
        </p>
        

      </section>

      <section className='card shadow'>
        
        <small>I would say I made this site with love but my relationship with css is a bit more complicated than that. Made in the MERN stack.</small>

      </section>

    </div>
  );
};

export default Home;
