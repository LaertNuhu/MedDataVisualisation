import xml.etree.ElementTree as ET
import pandas as pd

"""
This class is designed to parse an xml document to a pandas dataframe object. It can be used with a genaral
xml data but it is specificly designed with the purpoues to be used for the smokingRecods datasetset.
"""
class XMLDataframeParser:
    features = dict()

    """
    The findFeature function will be used on TEXT node contained on every Record Element.
    Parameters explenation:
    arry: accepts an array of lines. The imput is xml text data splited if \n (newline) is found
    string: is a string element and this is the title of the text data that we are searching for.
    For example if we want to collect all the data that corresponds to 'Report Status' the string
    would be 'Report Status :'
    skipString: because the data is not uniformal, meaning for each report there is not allways a
    'Report Status' to be found we need to skip somtimes and just give an empty sting or null as
    result. This parameter is of type string and is the next posible Title.
    nextLine: is of type boolean and it will be used to skip a line if a defined string is found.
    collectNext: For a paragraph there are multiple lines separated with (\n). That is a problem
    because we need a paragrah and not only the first line of the paragraph. For that reason we use
    a boolean if we want to have a hole paragraph and not only the first line.
    """
    def findFeature(self, arry, string, skipString, nextline, collectNext):
        try:
            i = arry.index(string)
            if nextline:
                i = i + 1
                if skipString != "":
                    if arry[i] == skipString:
                        return "NaN"
                arry[i] = self.appendText(arry, i, collectNext)
            return arry[i]
        except:
            return "NaN"

    # used to append lines that are in the same paragraph and so form a paragraph
    # array: the text lines separated by newline in a array
    # index: the index for the location of a specific element in the array
    # collectNext: a boolean parameter which is true if we want to collect the next element in the array
    def appendText(self, array, index, collectNext):
        if collectNext:
            paragraph = ""
            for i in range(index, len(array)):
                if not self.isEntry(array[i]):
                    paragraph = paragraph + array[i]
                else:
                    return paragraph
        else:
            return array[index]

    # Checks if we have a word, normaly a tiltle which starts with caps. Normaly at least the 2 first letters must be capital letters
    # string: is a single element of the text tag array
    def isEntry(self, string):
        if string[0].isupper() & string[1].isupper():
            return True
        else:
            return False

    # checks if node has text content
    def getValueOfNode(self, node):
        """ return node text or None """
        return node.text if node is not None else None

    # filters values out from columns which are not necessary
    def filterOut(self, dataframe, column, value):
        return dataframe[dataframe[column] != value]

    # removes empty rows
    # df refers to the dataframe object which we want to apply changes
    # column: the name of the column that we what to remove the empty rows
    def removeEmptyEntries(self, df, column):
        # filter results
        df = self.filterOut(df, column, "NaN")
        df = self.filterOut(df, column, "")
        return df

    # returns element attribute
    def getXMLElementAttribute(self, element, attribute):
        return element.attrib.get(attribute)

    # returns an xml element by name which is child of parent
    def getXMLElement(self, parent, element):
        return parent.find(element)

    # returns the childeren elements of the root
    # fileLocation: a string of the path to the xml file
    def getXMLRootChildren(self, fileLocation):
        xml = ET.parse(fileLocation)
        root = xml.getroot()
        return [child for child in root]

    # adds features derived from the text tag to the features directory
    # textArray is the 2 dimensional array: 1d for the record, 1d for the text itself in the record separated by newlines
    # feature refers to the desired feature that we want to be extracted. It should be an exact match with what we find on the XML data
    # skipString servers to idnore some strings by some specific feautures from the xml
    # collectNext is a boolean and hepls with creatinng a text paragraph
    # nextline is also a boolean and tells if we want to continue with the next line
    # featureKeyName is a string which we use to input as a key value to the features directory
    def addFeatureFromText(self, textArray, feature, skipString, nextline, collectNext, featureKeyName):
        featureArry = []
        for text in textArray:
            featureArry.append(self.findFeature(
                text, feature, skipString, nextline, collectNext))
        XMLDataframeParser.features[featureKeyName] = featureArry

    # finds and add the record ids to the features directory. The porpouse of this is to create a special coulumn named id
    # fileLocation: a string of the path to the xml file
    def addRecordIds(self, fileLocation):
        idArray = []
        rootChildren = self.getXMLRootChildren(fileLocation)
        for child in rootChildren:
            # the record id
            id = self.getXMLElementAttribute(child, "ID")
            idArray.append(id)
            XMLDataframeParser.features["id"] = idArray

    def addFeature(self, xmlNode, featureKeyName):
        print("we are not there yet")

    # returns the features directory
    def getFeatures(self):
        return self.features

    # gets the xml file location and outputs a list of arrays with text data
    # fileLocation: a string of the path to the xml file
    def getText(self, fileLocation):
        textArray = []
        rootChildren = self.getXMLRootChildren(fileLocation)
        # add record ids in the features dictionary. This is a feature that need to be discused
        # self.addRecordIds(fileLocation)
        # a loop is needed to index all records and texts
        for child in rootChildren:
            # find the text element and get the value
            textNode = self.getXMLElement(child, "TEXT")
            text = self.getValueOfNode(textNode)
            # text is splited if newline is found
            text = text.split("\n")[1:]
            textArray.append(text)
        return textArray

    # returns a dataframe object populated by the extracted features
    def getDataframe(self):
        # create a dataframe object
        df_xml = pd.DataFrame()
        # get the feauture directory
        features = self.getFeatures()
        #checks if it is empty
        if features:
            # get the directory keys and save them in a list
            featureColumns = [*features]
            # iterate through the list and add columns with the values in the DataFrame
            for column in featureColumns:
                df_xml[column] = features[column]
        return df_xml
