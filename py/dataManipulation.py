import xml.etree.ElementTree as ET
import pandas as pd

"""
This class is designed to parse an xml document to a pandas dataframe object. It can be used with a genaral
xml data but it is specificly designed with the purpoues to be used for the smokingRecods datasetset.
"""


# handels the xml to dataframe parsing
class XMLDataframeParser:
    features = dict()

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
    def isEntry(self, string):
        if string[0].isupper() & string[1].isupper():
            return True
        else:
            return False

    # checks if node has text content
    def getvalueofnode(self, node):
        """ return node text or None """
        return node.text if node is not None else None

    # filters values out from columns which are not necessary
    def filterOut(self, dataframe, column, value):
        return dataframe[dataframe[column] != value]

    # removes empty rows
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

    # returns the childeren elemnts of the root
    def getXMLRootChildren(self, fileLocation):
        xml = ET.parse(fileLocation)
        root = xml.getroot()
        return [child for child in root]

    # adds features derived from the text tag to the features directory
    # textArray is the 2 dimensional array: 1d for the record, 1d for the text itself in the record separated by newlines
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
    def getText(self, fileLocation):
        textArray = []
        rootChildren = self.getXMLRootChildren(fileLocation)
        # add record ids in the features dictionary. We want to have ids as a featureColumn
        self.addRecordIds(fileLocation)
        # a loop is needed to index all records and texts
        for child in rootChildren:
            # find the text element and get the value
            textNode = self.getXMLElement(child, "TEXT")
            text = self.getvalueofnode(textNode)
            # text is splited if newline is found
            text = text.split("\n")[1:]
            textArray.append(text)
        return textArray

    def getDataframe(self):
        # create a dataframe object
        df_xml = pd.DataFrame()
        # get the feauture directory
        features = self.getFeatures()
        # get the directory keys and save them in a list
        featureColumns = [*features]
        # iterate through the list and add columns with the values in the DataFrame
        for column in featureColumns:
            df_xml[column] = features[column]
        return df_xml
