/* eslint-disable react/no-unescaped-entities */
import '../css/Home.css';
import React from 'react';

const Home = () => {
  return (
    <div className="home">

      <section>
        <h3> Hi! </h3>

        <p>
          I'm Navy, or Erik. I'm a 20-something year old software developer from Finland. I don't really do design™, so excuse the oddly themed page (it's also probably unfinished).
        </p>

        <p>
          I like to volunteer some of my free time in online communities both as a moderator as well as a bot developer and maintainer.
          My longest running project is a Discord bot named <a href='https://galactic.corgi.wtf'>Galactic</a> that I was invited to join in 2016 and have been maintaining and developing since.
        </p>

        <p>
          On top of software development I enjoy playing vidya, of which I may occasionally post clips in the media page on this site.
          Beyond that there isn't much else to know about me, am simple man.
        </p>

        <p>
          <small><small>P.S. corgis r amazing</small></small>
        </p>
      </section>
      
      <section>
        <h3> While you're here... </h3>
        <p>
          If you have about 15 minutes, see the video on the left. If you have more time, see the one on the right.
        </p>
        <div className='flex-container'>
          <iframe 
            width="640" height="360"
            src="https://www.youtube.com/embed/CoFjbnvkmQ0"
            title="YouTube video player" frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen />

          <iframe
            width="640" height="360"
            src="https://www.youtube.com/embed/HnZSaKYmP2s"
            title="YouTube video player" frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen />
        </div>

      </section>

    </div>
  );
};

export default Home;
