from nltk.stem import WordNetLemmatizer
from nltk.stem.porter import PorterStemmer
# from nltk.stem.snowball import SnowballStemmer
# from nltk.stem.lancaster import LancasterStemmer
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import nltk
import string
import unicodedata


class Normalizer:
    """docstring for Normalizer."""

    # returns tokens
    def tokenize(self, data):
        return word_tokenize(data)

    # transforms tokens to Lowercase
    def toLowerCase(self, tokens):
        return [w.lower() for w in tokens]

    # removes punctuation
    def removePunctuation(self, tokens):
        table = str.maketrans('', '', string.punctuation)
        return [w.translate(table) for w in tokens]

    # removes numbers and other characters that are non-alphabetic
    def removeNonAlpha(self, tokens):
        return [token for token in tokens if token.isalpha()]

    # removes stopwords
    def removeStopWords(self, words):
        stop_words = set(stopwords.words('english'))
        return [w for w in words if not w in stop_words]

    # returns the words stem
    def stemTokens(self, tokens):
        porter = PorterStemmer()
        return [porter.stem(token) for token in tokens]

    # returns the words lemma
    def lemmatizeTokens(self, tokens):
        lemmatizer = WordNetLemmatizer()
        return [lemmatizer.lemmatize(token) for token in tokens]

    # returns the words lemma
    def lemmatizeVerbs(self, tokens):
        lemmatizer = WordNetLemmatizer()
        return [lemmatizer.lemmatize(token,pos='v') for token in tokens]

    # returns a zip data type with the words and the POS tagg attatched to it
    def getPosTags(self, tokens):
        return nltk.pos_tag(tokens)

    # used by the count vectorizer from sklearn
    # lemmatizing: boolean, true if lemmatization is preffered, false: if stemming is used
    # POS: boolean, true if POS taggs are required, false if not
    def normalize(self, data, lemmatizing, POS):
        tokens = self.tokenize(data)
        tokens = self.toLowerCase(tokens)
        tokens = self.removePunctuation(tokens)
        tokens = self.removeNonAlpha(tokens)
        tokens = self.removeStopWords(tokens)
        if lemmatizing:
            tokens = self.lemmatizeTokens(tokens)
        else:
            tokens = self.stemTokens(tokens)
        if POS:
            tokens = self.getPosTags(tokens)
        return tokens

    # used by the skipgramm implementation
    # lemmatizing: boolean, true if lemmatization is preffered, false: if stemming is used
    # POS: boolean, true if POS taggs are required, false if not
    def normalizeArray(self, data, lemmatizing, POS):
        text = [word_tokenize(line.strip()) for line in data]
        result = []
        for tokenArray in text:
            tokens = self.toLowerCase(tokenArray)
            tokens = self.removePunctuation(tokens)
            tokens = self.removeNonAlpha(tokens)
            tokens = self.removeStopWords(tokens)
            if lemmatizing:
                tokens = self.lemmatizeTokens(tokens)
            else:
                tokens = self.stemTokens(tokens)
            if POS:
                tokens = self.getPosTags(tokens)
            result.append(tokens)
        return result
