import React from "react";
import { Link } from "react-router-dom";

export const Navigation = ({ isLoggedIn, onLogout }) => {
  return (
    <nav id="menu" className="navbar navbar-default navbar-fixed-top">
      <div className="container">
        <div className="navbar-header">
          <button
            type="button"
            className="navbar-toggle collapsed"
            data-toggle="collapse"
            data-target="#bs-example-navbar-collapse-1"
          >
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>

          {/* 로고 / 브랜드 */}
          <Link to="/" className="navbar-brand page-scroll">
            CHATBOT
          </Link>
        </div>

        <div
          className="collapse navbar-collapse"
          id="bs-example-navbar-collapse-1"
        >
          <ul className="nav navbar-nav navbar-right">
            {!isLoggedIn ? (
              <>
                <li>
                  <Link to="/login" className="page-scroll">
                    로그인
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="page-scroll">
                    회원가입
                  </Link>
                </li>
              </>
            ) : (
              <li>
                <span
                  style={{ cursor: "pointer", padding: "15px", display: "inline-block" }}
                  onClick={onLogout}
                >
                  로그아웃
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};
