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
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col m-auto items-center justify-center min-h-screen bg-black w-screen">
        <div className="bg-gradient-to-bl from-indigo-400 via-blue-500 to-purple-600 p-8 rounded-xl">
          <div>
            <h1 className="text-white  font-bold py-2 px-2 rounded-xl mb-5">
              <div className="text-6xl -mb-2">BUY ME</div>
              {error && <div>{error}</div>}
              <div className="text-6xl">A COFFEE ☕️</div>
            </h1>
            <div className="flex">
              {presets.map((preset) => {
                return (
                  <button
                    className="px-4 text-white font-medium bg-green-500 mx-1 rounded-full hover:bg-green-400 transition-all"
                    key={preset}
                    onClick={() => setQuantity(preset)}
                  >
                    {preset}
                  </button>
                );
              })}
              <input
                className="rounded-xl mx-1 px-3"
                type="number"
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
              id="message"
              onChange={(e) => setMessage(e.target.value)}
              value={message}
            />
          </div>
          <button
            onClick={handleCheckout}
            className="group p-5 mt-2 font-medium border rounded-xl text-white bg-purple-500 hover:bg-purple-400 hover:ring-1 ring-blue-400 transition-all"
          >
            Donate ={" "}
            <span className=" bg-purple-400 text-white p-1 rounded-md group-hover:bg-purple-500 transition-all">
              {" "}
              ${(quantity * DONATION_IN_CENTS) / 100}
            </span>
          </button>
        </div>
        <div className="flex flex-col">
          <h1 className="text-white">Previous Donations</h1>
          {donations.map((donation) => {
            return (
              <div key={donation.id} className="p-4 text-white shadow mb-2">
                {donation.fields.name} donated ${donation.fields.amount}
                <br /> Message: {donation.fields.message}
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
