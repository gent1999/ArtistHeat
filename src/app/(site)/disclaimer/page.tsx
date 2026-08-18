import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'ArtistHeat disclaimer -- site content, third-party links, and our policy on AI-generated editorial images.',
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-[800px] px-4 py-14">
      <h1 className="mb-2 inline-block border-b-2 border-red-600 pb-2 text-3xl font-black tracking-wide text-red-600 uppercase">
        Disclaimer
      </h1>
      <p className="mt-4 mb-8 text-sm text-neutral-500">Last updated: January 2025</p>

      <div className="space-y-6 leading-relaxed text-neutral-700">
        <p>
          The information provided on this website is for general informational purposes only. All information on
          the site is provided in good faith, however we make no representation or warranty of any kind, express or
          implied, regarding the accuracy, adequacy, validity, reliability, availability or completeness of any
          information on the site.
        </p>
        <p>
          Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a
          result of the use of the site or reliance on any information provided on the site. Your use of the site
          and your reliance on any information on the site is solely at your own risk.
        </p>
        <p>
          The site may contain links to other websites or content belonging to or originating from third parties or
          links to websites and features in banners or other advertising. Such external links are not investigated,
          monitored, or checked for accuracy, adequacy, validity, reliability, availability or completeness by us.
        </p>
        <p>
          We do not warrant, endorse, guarantee, or assume responsibility for the accuracy or reliability of any
          information offered by third-party websites linked through the site or any website or feature linked in
          any banner or other advertising.
        </p>
        <p>
          We shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to
          be caused by or in connection with the use of or reliance on any such content, goods or services available
          on or through any such website or services.
        </p>
        <p>
          We strongly advise you to read the terms and conditions and privacy policies of any third-party websites
          or services that you visit.
        </p>

        <h2 className="pt-4 text-xl font-black tracking-wide uppercase">Contact Us</h2>
        <p>If you have any questions about this Disclaimer, you can contact us:</p>
        <ul className="list-disc pl-5">
          <li>
            By email:{' '}
            <a href="mailto:info@artistheat.com" className="font-semibold text-red-600 hover:underline">
              info@artistheat.com
            </a>
          </li>
        </ul>

        <p>
          <strong className="text-neutral-900">Note on AI-generated images of celebrities:</strong> We utilize
          AI-generated images of celebrities under the fair use doctrine for editorial purposes only. Such images
          are not intended to imply endorsement or affiliation with our services. As an artist, star, celebrity or
          famous person you have rights too. If you do not like an AI image we&rsquo;ve made, you can send us an
          email and we will remove it. More and more companies are using AI instead of Shutterstock and Getty images
          &mdash; this is the new generation. If you don&rsquo;t like something written about you, or want people to
          know your exact net worth, send us an email and we will remove it or change it.
        </p>
        <p>
          Our content is original and not AI written. We do a lot of research and write based on our own knowledge,
          ideas, vision, and mission. If you don&rsquo;t like something written about you, send us an email and we
          will remove it:{' '}
          <a href="mailto:info@artistheat.com" className="font-semibold text-red-600 hover:underline">
            info@artistheat.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
