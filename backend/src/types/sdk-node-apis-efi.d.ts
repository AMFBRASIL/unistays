declare module 'sdk-node-apis-efi' {
  interface EfiPayOptions {
    sandbox: boolean;
    client_id: string;
    client_secret: string;
    /** Caminho do arquivo .p12 ou string Base64 do certificado quando cert_base64 é true */
    certificate: string;
    cert_base64?: boolean;
    pix_cert?: string;
  }

  export default class EfiPay {
    constructor(options: EfiPayOptions);
    pixCreateImmediateCharge(
      params: Record<string, unknown>,
      body: Record<string, unknown>
    ): Promise<Record<string, unknown>>;
  }
}
