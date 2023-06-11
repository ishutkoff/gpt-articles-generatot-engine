import delay from "delay";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
  apiKey: "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",
});
const gpt3 = new OpenAIApi(configuration);

async function askQuestions(keywords: string) {
  interface Article {
    title: string;
    code: string;
    description: string;
    text: string;
    preview_pic?: string;
  }
  const article: Article = {
    title: null,
    code: null,
    description: null,
    text: null,
    preview_pic: null,
  };

  const conversation: ChatCompletionRequestMessage[] = [];

  async function getAnswer(question: string) {
    conversation.push({ role: "user", content: question });
    const response = await gpt3.createChatCompletion({
      model: "gpt-3.5-turbo",
      max_tokens: 3000,
      presence_penalty: 2,
      temperature: 0.5,
      messages: conversation,
    });

    return response["data"]["choices"][0]["message"]["content"].replace(
      /(\r\n|\n|\r)/gm,
      " "
    );
  }

  article.text = await getAnswer(
    `Напиши title объёмом 70-80 заголовок к этой статье`
  );

  const answer = await getAnswer(
    `Напиши краткое содержание состоящее из 5 пунктов, к статье на тему "${keywords}". Оформи в виде списка. Оформи в виде списка. Оберни в тег ul`
  );

  const subQuestions = answer
    .match(/<li>(.*?)<\/li>/gm)
    .map(match => match.replace(/<\/?li>/g, ""));
  for (const subQuestion of subQuestions) {
    article.text += await getAnswer(
      `Напиши большой раздел к этой статьи под заголовком "${subQuestion}". Оберни абзацы в теги p, заголовки в тег h2 а так же списки в  ul или ol. Оберни слова которые есть в вопросе в тег strong`
    );
    await delay(30000);
  }

  article.title = await getAnswer(
    `Напиши title объёмом 70-80 заголовок к этой статье`
  );

  article.description = await getAnswer(
    `Напиши meta-description объёмом 150-200 знаков для этой статьи`
  );

  return article;
}

(async () => {
  console.log(
    await askQuestions(
      "Какие возможные причины развития аритмии сердца и как ее можно лечить?"
    )
  );
})();
