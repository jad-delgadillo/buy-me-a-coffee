import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { DONATION_IN_CENTS, MAX_DONATION_IN_CENTS } from "../config";
import { Record } from "../types";

export default function Home({ donations }: { donations: Array<Record> }) {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const presets = [1, 3, 5];

  async function handleCheckout() {
    setError(null);
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity,
        name,
        message,
      }),
    });

    const res = await response.json();

    if (res.url) {
      const url = res.url;

      router.push(url);
    }
    if (res.error) {
      setError(res.error);
    }
  }

  return (
    <div>
      <Head>
        <title>alw. Coffee ☕️</title>
        <meta name="description" content="Support the future" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col md:flex-row m-auto items-center justify-center min-h-screen bg-black w-screen">
        <div className="bg-gradient-to-bl from-indigo-400 via-blue-500 to-purple-600 p-8 w-[80%] mt-10 md:max-w-md rounded-xl">
          <div>
            <h1 className="text-white  font-bold py-2 px-2 rounded-xl mb-5">
              <div className="md:text-6xl text-4xl -mb-2">BUY ME</div>
              {error && <div>{error}</div>}
              <div className="md:text-6xl text-4xl">A COFFEE</div>
              <p className="text-white font-normal w-32 flex rounded-full border items-center justify-center">
                by alwaysjad
              </p>
            </h1>
            <div className="flex md:justify-start justify-center items-center">
              {" "}
              <p className="text-5xl">☕️</p>
              <p className="text-white pl-2 pr-1">x</p>
              {presets.map((preset) => {
                return (
                  <button
                    className="px-4 py-1 text-white font-medium bg-green-500 mx-1 rounded-md hover:bg-green-400 transition-all"
                    key={preset}
                    onClick={() => setQuantity(preset)}
                  >
                    {preset}
                  </button>
                );
              })}
              <p className="text-white">{"="}</p>
              <input
                className="flex flex-col h-8 items-center justify-center w-10 p-1 rounded-md  ml-1"
                type="text"
                onChange={(e) => setQuantity(parseFloat(e.target.value))}
                value={quantity}
                min={1}
                max={MAX_DONATION_IN_CENTS / DONATION_IN_CENTS}
              />
            </div>
          </div>
          <div className="flex flex-col mt-2">
            <label className="text-white font-medium" htmlFor="name">
              Name
            </label>
            <input
              className="border rounded-xl p-1"
              placeholder="name or @yourtwitter (optional)"
              type="text"
              id="name"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>
          <div className="flex flex-col mt-2">
            <label className="text-white font-medium" htmlFor="message">
              Message
            </label>
            <textarea
              className="border rounded-xl p-1"
              placeholder="say something nice... (optional)"
              id="message"
              onChange={(e) => setMessage(e.target.value)}
              value={message}
            />
          </div>
          <a
            onClick={handleCheckout}
            href="#_"
            className="relative mt-5 inline-flex items-center justify-center p-4 px-5 py-3 overflow-hidden font-medium text-indigo-600 transition duration-300 ease-out rounded-full shadow-xl group hover:ring-1 hover:ring-green-500"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-green-400 via-blue-600 to-indigo-400"></span>
            <span className="absolute bottom-0 right-0 block w-64 h-64 mb-32 mr-4 transition duration-500 origin-bottom-left transform rotate-45 translate-x-24 bg-green-500 rounded-full opacity-40 group-hover:rotate-90 ease"></span>
            <span className="relative text-white">
              Support ={" "}
              <span className="  text-white p-1 rounded-md  transition-all">
                {" "}
                ${(quantity * DONATION_IN_CENTS) / 100} MXN
              </span>
            </span>
          </a>
          {/* <button
            onClick={handleCheckout}
            className="group p-5 mt-4 font-semibold rounded-full text-white bg-purple-500  hover:ring-2 ring-purple-400 transition-all"
          >
            Support ={" "}
            <span className="  text-white p-1 rounded-md  transition-all">
              {" "}
              ${(quantity * DONATION_IN_CENTS) / 100} MXN
            </span>
          </button> */}
        </div>
        <div className="flex flex-col p-10 max-w-xs m-5 rounded-xl bg-slate-100 hidden">
          <h1 className="font-medium mb-2 bg-indigo-500 rounded-2xl text-white p-2">
            Previous Supporters 🚀
          </h1>
          {donations.map((donation) => {
            return (
              <div
                key={donation.id}
                className="p-4 text-black rounded-lg shadow-sm shadow-neutral-600 mb-2"
              >
                <span className="font-medium"> {donation.fields.name}</span>{" "}
                <br />
                <span className="text-green-500">
                  {" "}
                  ${donation.fields.amount} MXN
                </span>
                <br /> Message: <br />{" "}
                <span className="text-blue-500">
                  {" "}
                  &#34;{donation.fields.message}&#34;
                </span>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // get protocol from context
  const protocol = context.req.headers["x-forwarded-proto"] || "http";

  const response = await fetch(
    `${protocol}://${context.req.headers.host}/api/donations`
  );

  const donations = await response.json();

  return {
    props: {
      donations,
    },
  };
};
