import { useSettings } from '@/components/use-settings';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="h1 mb-6">About Codelive</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="h2 mb-4">What is Codelive?</h2>
          <p className="text-lg leading-relaxed">
            Codelive is an innovative platform that revolutionizes how developers interact with code. 
            It provides a seamless environment for real-time coding, collaboration, and AI-assisted development.
          </p>
        </section>

        <section>
          <h2 className="h2 mb-4">Key Features</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Real-time collaborative coding</li>
            <li>AI-powered code generation and analysis</li>
            <li>Instant code execution and debugging</li>
            <li>Integrated version control and sharing</li>
            <li>Customizable development environment</li>
          </ul>
        </section>

        <section>
          <h2 className="h2 mb-4">Our Vision</h2>
          <p className="text-lg leading-relaxed">
            At Codelive, we envision a future where coding is more intuitive, collaborative, and accessible. 
            We're building tools that empower developers to focus on creating while we handle the complexity.
          </p>
        </section>
      </div>
    </div>
  );
}
